import type { RunnableConfig } from "@langchain/core/runnables";
import {
  type CheckpointTuple,
  type SerializerProtocol,
  type PendingWrite,
  CheckpointPendingWrite,
} from "@langchain/langgraph-checkpoint";

export class ShortMemoryUtils {
  private static readonly REDIS_KEY_SEPARATOR = ":";

  static makeRedisCheckpointKey(
    threadId: string,
    checkpointNs: string,
    checkpointId: string
  ): string {
    return ["checkpoint", threadId, checkpointNs, checkpointId].join(
      this.REDIS_KEY_SEPARATOR
    );
  }

  static makeRedisCheckpointWritesKey(
    threadId: string,
    checkpointNs: string,
    checkpointId: string,
    taskId: string,
    idx: number | null
  ): string {
    const key = ["writes", threadId, checkpointNs, checkpointId, taskId];

    if (idx === null) {
      return key.join(this.REDIS_KEY_SEPARATOR);
    }

    return [...key, idx.toString()].join(this.REDIS_KEY_SEPARATOR);
  }

  static parseRedisCheckpointWritesKey(redisKey: string): Record<string, string> {
    const [namespace, thread_id, checkpoint_ns, checkpoint_id, task_id, idx] =
      redisKey.split(this.REDIS_KEY_SEPARATOR);

    if (namespace !== "writes") {
      throw new Error("Expected checkpoint key to start with 'writes'");
    }

    return {
      thread_id,
      checkpoint_ns,
      checkpoint_id,
      task_id,
      idx,
    };
  }

  static filterKeys(
    keys: string[],
    before?: RunnableConfig,
    limit?: number
  ): string[] {
    let processedKeys = keys;

    if (before) {
      processedKeys = processedKeys.filter((k) => {
        const checkpointKey = this.parseRedisCheckpointKey(k);
        return checkpointKey.checkpoint_id < before.configurable?.checkpoint_id;
      });
    }

    processedKeys = processedKeys.sort((a, b) => {
      const checkpointKeyA = this.parseRedisCheckpointKey(a);
      const checkpointKeyB = this.parseRedisCheckpointKey(b);
      return checkpointKeyA.checkpoint_id.localeCompare(checkpointKeyB.checkpoint_id);
    });

    if (limit) {
      processedKeys = processedKeys.slice(0, limit);
    }

    return processedKeys;
  }

  static dumpWrites(
    serde: SerializerProtocol,
    writes: PendingWrite[]
  ): { channel: string; type: string; value: Uint8Array }[] {
    return writes.map(([channel, value]) => {
      const [type, serializedValue] = serde.dumpsTyped(value);
      return { channel, type, value: serializedValue };
    });
  }

  static async loadWrites(
    serde: SerializerProtocol,
    taskIdToData: Record<string, Record<string, string>>
  ): Promise<CheckpointPendingWrite[]> {
    const writesPromises = Object.entries(taskIdToData).map(
      async ([taskId, data]) =>
        [
          taskId.split(",")[0],
          data.channel,
          await serde.loadsTyped(data.type, this.decodeCommaSeparatedString(data.value)),
        ] as CheckpointPendingWrite
    );

    return Promise.all(writesPromises);
  }

  static async parseRedisCheckpointData(
    serde: SerializerProtocol,
    key: string,
    data: Record<string, string>,
    pendingWrites?: CheckpointPendingWrite[]
  ): Promise<CheckpointTuple> {
    const parsedKey = this.parseRedisCheckpointKey(key);
    const { thread_id, checkpoint_ns = "", checkpoint_id } = parsedKey;

    const config = {
      configurable: {
        thread_id,
        checkpoint_ns,
        checkpoint_id,
      },
    };

    const checkpoint = await serde.loadsTyped(
      data.type,
      this.decodeCommaSeparatedString(data.checkpoint)
    );

    const metadata = await serde.loadsTyped(
      data.metadata_type,
      this.decodeCommaSeparatedString(data.metadata)
    );

    const parentCheckpointId = data.parent_checkpoint_id;
    const parentConfig = parentCheckpointId
      ? {
          configurable: {
            thread_id,
            checkpoint_ns,
            checkpoint_id: parentCheckpointId,
          },
        }
      : undefined;

    return { config, checkpoint, metadata, parentConfig, pendingWrites };
  }

  static parseRedisCheckpointKey(redisKey: string): Record<string, string> {
    const [namespace, thread_id, checkpoint_ns, checkpoint_id] =
      redisKey.split(this.REDIS_KEY_SEPARATOR);

    if (namespace !== "checkpoint") {
      throw new Error("Expected checkpoint key to start with 'checkpoint'");
    }

    return {
      thread_id,
      checkpoint_ns,
      checkpoint_id,
    };
  }

  private static decodeCommaSeparatedString(str: string): string {
    const numbers = str.split(",").map((num) => parseInt(num, 10));
    const uint8Array = new Uint8Array(numbers);
    return new TextDecoder().decode(uint8Array);
  }
}
