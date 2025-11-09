# Cloudflare variables
variable "cloudflare_zone" {
  description = "Domain used to expose the VPS instance to the Internet"
  type        = string
}

variable "cloudflare_zone_id" {
  description = "Zone ID for your domain"
  type        = string
}

variable "cloudflare_account_id" {
  description = "Account ID for your Cloudflare account"
  type        = string
  sensitive   = true
}

variable "cloudflare_emails" {
  description = "List of emails for the Cloudflare account"
  type        = list(string)
  default     = []
}

variable "cloudflare_token" {
  description = "Cloudflare API token"
  type        = string
  sensitive   = true
}

variable "idp_github_client_id" {
  description = "GitHub Client ID"
  type        = string
  sensitive   = true
}

variable "idp_github_client_secret" {
  description = "GitHub Client Secret"
  type        = string
  sensitive   = true
}
