# Cloudflare Terraform Provider

The [Cloudflare Terraform provider](https://registry.terraform.io/providers/cloudflare/cloudflare/latest/docs) provides convenient access to the [Cloudflare REST API](https://developers.cloudflare.com/api) from Terraform.

## Requirements

This provider requires Terraform CLI version 1.0 or later. You can [install it for your system](https://developer.hashicorp.com/terraform/install) from Hashicorp's website.

## Usage

Add the following to your `main.tf` (in this case, it is in the `providers.tf`) file:

<!-- x-release-please-start-version -->

```hcl
# Declare the provider and version
terraform {
  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 5.12.0"
    }
  }
}


# Initialize the provider
provider "cloudflare" {
  # The preferred authorization scheme for interacting with the Cloudflare API.
  api_token = "Sn3lZJTBX6kkg7OdcBUAxOO963GEIyGQqnFTOFYY" # or set CLOUDFLARE_API_TOKEN environment variable
  # The previous authorization scheme for interacting with the Cloudflare API.
  # When possible, use API tokens instead of Global API keys.
  api_key = "144c9defac04969c7bfad8efaa8ea194" # or set CLOUDFLARE_API_KEY environment variable
  # The previous authorization scheme for interacting with the Cloudflare API, used in conjunction with a Global API key.
  api_email = "user@example.com" # or set CLOUDFLARE_EMAIL environment variable
}

# Configure a resource
resource "cloudflare_zone" "example_zone" {
  account = {
    id = "023e105f4ecef8ad9ca31a8372d0c353"
  }
  name = "example.com"
  type = "full"
}
```


Setting up a tunnel requires some preliminary steps:

- Enable a domain on the Cloudflare registry (acquire or transfer one).
- Adapt the `tunnel.tf` file to your context and run the code that performs the following steps:
  - Add a tunnel to your account.
  - Bind the tunnel to a DNS subdomain.
  - Configure the Docker network ingress rules (e.g., service name and ports).
- Create a Cloudflared Docker service to manage the tunnel:

```hcl
  cloudflared:
    image: cloudflare/cloudflared:latest
    restart: always
    container_name: cloudflared
    command: tunnel run --token ${TUNNEL_TOKEN}
    depends_on:
      - <YOUR_TUNNELED_SERVICE>
```

Setting up a tunnel requires some preliminary steps:

- Enable a domain on the Cloudflare registry (acquire or transfer one).
- Adapt the `tunnel.tf` file to your context and run the code that performs the following steps:
  - Add a tunnel to your account.
  - Bind the tunnel to a DNS subdomain.
  - Configure the Docker network ingress rules (e.g., service name and ports).
- Create a Cloudflared Docker service to manage the tunnel:

```hcl
  cloudflared:
    image: cloudflare/cloudflared:latest
    restart: always
    container_name: cloudflared
    command: tunnel run --token ${TUNNEL_TOKEN}
    depends_on:
      - <YOUR_TUNNELED_SERVICE>
```

Finally, to authenticate the tunnel when it starts, you must create a tunnel token and add it to your `.env` file.
To create a new token, run the following command in your terminal:

```
curl -X POST "https://api.cloudflare.com/client/v4/accounts/<ACCOUNT_ID>/cfd_tunnel/<TUNNEL_ID>/token" \
  -H "Authorization: Bearer <API_TOKEN>" \
  -H "Content-Type: application/json"
 ```

💡 Tip: The token is unique for each tunnel. In case the token is lost, you must revoke the old one before generating a new one.


## Cloudflare Zero Trust Access Configuration 

The Terraform `access.tf` configuration file defines the Zero Trust Access Control setup for the Cloudflare-protected EvolutionAPI application.  
It handles authentication (via GitHub OAuth2), authorization policies (based on email rules), and application access management.

In a nutshell the following is accomplished with this config:
- GitHub IDP	Authenticates users through GitHub OAuth2
- Access Policy	Defines who is allowed based on email/domain
- Access Application	Binds the above resources to a specific app and domain










