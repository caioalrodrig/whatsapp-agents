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


# Creates a reusable Access policy.
resource "cloudflare_zero_trust_access_policy" "allow_emails" {
  account_id   = var.cloudflare_account_id
  name         = "Allow email addresses"
  decision     = "allow"
  include      = [
    {
      email = {
        email = var.cloudflare_emails[1]
      }
    },
    {
      email_domain = {
        domain = "@gmail.com"
      }
    }
  ]
}

# Creates an Access application to control who can connect to the public hostname.
resource "cloudflare_zero_trust_access_application" "evo2" {
  account_id       = var.cloudflare_account_id
  type             = "self_hosted"
  name             = "Access application for evo2.${var.cloudflare_zone}"
  domain           = "evo2.${var.cloudflare_zone}"
  policies = [
    {
      id = cloudflare_zero_trust_access_policy.allow_emails.id
      precedence = 1
    }
  ]
  allowed_idps = [
    cloudflare_zero_trust_access_identity_provider.github.id
  ]
}
