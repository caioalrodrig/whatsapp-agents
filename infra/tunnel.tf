# Creates a new remotely-managed tunnel for the GCP VM.
resource "cloudflare_zero_trust_tunnel_cloudflared" "win_tunnel" {
  account_id    = var.cloudflare_account_id
  name          = "Terraform win_tunnel VPS tunnel"
  config_src    = "cloudflare"
}

# Reads the token used to run the tunnel on the server.
data "cloudflare_zero_trust_tunnel_cloudflared_token" "win_tunnel" {
  account_id   = var.cloudflare_account_id
  tunnel_id   = cloudflare_zero_trust_tunnel_cloudflared.win_tunnel.id
}

# Creates the CNAME record that routes win_tunnel.${var.cloudflare_zone} to the tunnel.
resource "cloudflare_dns_record" "evo2" {
  zone_id = var.cloudflare_zone_id
  name    = "evo2"
  content = "${cloudflare_zero_trust_tunnel_cloudflared.win_tunnel.id}.cfargotunnel.com"
  type    = "CNAME"
  ttl     = 1
  proxied = true
}

# Configures tunnel with the published Evolution V2 application.
resource "cloudflare_zero_trust_tunnel_cloudflared_config" "win_tunnel_config" {
  tunnel_id  = cloudflare_zero_trust_tunnel_cloudflared.win_tunnel.id
  account_id = var.cloudflare_account_id
  config     = {
    ingress   = [
      {
        hostname = "evo2.${var.cloudflare_zone}"
        service  = "http://evolution_v2:8080"
      },
      {
        service  = "http_status:404"
      }
    ]
  }
}

