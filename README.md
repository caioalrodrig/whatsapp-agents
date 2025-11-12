# How to use Cloudflare to work around VPN-related connection issues on WhatsApp integration App or in whatever domain 
WhatsApp (WPP), a tool loved by Brazilians, is the communication channel adopted by major companies in Brazil and around the world. The app offers an API that connects to LLMs, calendars, ecommerce platforms and email.

In this article, I share a setup I designed to build a customer relationship channel. It’s based on a real project where I connected a repurposed local machine to an enterprise remote server, managing to work around VPN related issues.

# Understanding the context

**WhatsAPP API**

The WhatsApp Business API despite being the official API, is limited in some resources. Only some message types are allowed, like utility, marketing, authentication, and service, still following predefined templates set by the platform. Besides that, each business account is limited to a single phone number.

**Unofficial APIs**

Unofficial APIs get around the limitations of the official ones, but they’re not meant for production since they don’t comply with Meta’s policies. In general, they fall into two main categories,

- Proprietary APIs: Paid solutions such as Z-API and MegaAPI, which charge per active instance (connected device). They propose performance, availability, and technical support. The “advantage” is that you don’t need to handle infrastructure yourself. However, the downsides include low control and vendor lock-in.

- Self-hosted APIs: These are open-source solutions, usually based on Baileys, which emulates a WhatsApp Web client to interact with Meta’s servers for sending and receiving messages. The most popular services in this category are EvolutionAPI and WAHA, available as Docker images.

# The company's problem

The project involved a WhatsApp-based customer relationship system for automated Question & Answer using Evo API. The team’s decision to go with Evo introduced an extra challenge. Using unofficial APIs, even just for testing in a local environment, can quickly lead to phone number bans.

One of the root causes for banning is to connect a device within a suspicious network, as of Meta's whitepaper. "IP address and associated carrier information can be used to teach our machine learning systems the difference between bulk and normal registrations". 

Meta keeps track of IPs used by spammers and bots, as well as geolocation mismatch when phone number’s country of origin differs from the IP’s country. The challenge is that VPN providers, VPS hosts (like Hostinger or Contabo), and even major cloud platforms may be included on the blacklist.

# Solutioning

With the big picture in mind, I’ll now detail how I addressed the IP-ban in a unnexpensive fashion, repurposing a local machine as a local server. The figure below illustrates the architecture overview:

Minimizar imagem
Editar imagem
Excluir imagem

Adicionar legenda (opcional)

The company’s local machine outside the VPN zone is the ideal environment to run EvoAPI inside Docker. By using a rotating IP address from a national provider, the risk of WhatsApp connection bans goes down to zero. The overall infrastructure also includes a web server hosted on VPS, which works as the LLM pipeline back-end for automation, handling message processing and responses.

Local server:

- Ubuntu 22.04 Headless, 12GB RAM, 250GB SSD, 250MB/s fiber connection.

- Containers running Evolution and auxiliary services: RabbitMQ (Evolution as producer), Redis for message caching, and Postgres for Evo config persistence.

- Cloudflare container for tunnel implementation. 

The setup handles a reasonable workload and the best part is that it eliminates the need for a VPN, avoiding security gaps with the company's production network and configuration overheads. Cloudflare Zero Trust does the trick, it allows you to expose in a secure fashion your network, services, or clusters to the internet.

Using Cloudflare Tunnel makes it possible to access locally running containers through a secure TLS (HTTPS) connection with a real internet domain without opening router ports. One common use case is remotely monitoring Grafana dashboards directly from a browser. It’s a robust way to gain remote access to servers for a wide range of applications. Doing so securely, with proper authentication, helps avoid major risks.

Cloudflare Zero Trust is a powerful tool for this purpose, allowing you to configure access applications with security policies and IP restrictions. The Terraform example below demonstrates how to configure a GitHub Identity Provider, effectively acting as an authentication firewall for your web services. 

```
# Creates a OAuth2 identity provider.
resource "cloudflare_zero_trust_access_identity_provider" "github" {
  name       = "GitHub Login"
  type       = "github"
  account_id = var.cloudflare_account_id
  zone_id    = var.cloudflare_zone_id
  config = {
    client_id     = var.idp_github_client_id
    client_secret = var.idp_github_client_secret
  }
}
```
