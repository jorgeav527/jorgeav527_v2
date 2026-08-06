+++
title = "Kroma App"
date = 2026-02-01
description = "An end-to-end serverless platform for kromacompany.com that brings together healthcare consulting, educational services, and e-commerce experiences. Built on AWS with Pulumi IaC, a Nuxt.js 4 frontend, and a FastAPI backend on Lambda, it shows how modern cloud architectures can deliver scalable, cost-effective, and highly automated solutions across multiple business domains."
[extra]
thumbnail = "thumbnail.png"
tags = ["devops", "programming", "cloud"]
+++

## Overview

Kroma is a cloud-native platform for kromacompany.com that brings together healthcare consulting, educational services, and e-commerce. I own the whole stack — infrastructure (Pulumi), backend (FastAPI on Lambda), and frontend (Nuxt.js 4) — plus the CI/CD that ships them all to AWS.

{{ my_img(src="meme_1.png", alt="Kroma logo", class="w-32") }}

## Architecture

{{ d3_architecture(id="kroma-app") }}

## Design

**Serverless-first.** Every component scales independently. API Gateway triggers Lambda on demand — no servers to manage, no idle cost.

**Nuxt.js 4 SSG on S3 + CloudFront.** The frontend is fully static, served from S3 with CloudFront for global low-latency delivery. Route53 handles DNS at the edge.

**Cognito for auth.** User pools manage customers and admins across the business domains. Tokens flow through API Gateway to Lambda authorizers.

**DynamoDB as the single data store.** Four tables cover transactional and session data; S3 holds the SPA and access logs.

## Key decisions

**Why serverless.** Scale-to-zero removes idle cost for a low-traffic business site; each service scales independently and has a clear billing signal.

**Pulumi over Terraform.** The infrastructure started on Terraform and was migrated to Pulumi (Python) for real loops and conditionals, keeping the legacy state bucket. Three stacks deploy in order: shared → frontend → backend.

**Nuxt SSG on S3, not SSR.** Static generation served through CloudFront means CDN pricing and zero servers; the trade-off is that interactive flows go through the API.

**Managed identity.** Cognito for sign-up and sign-in, with JWT validation at the gateway — no auth code to maintain, roles scoped per business domain.

**Clean-architecture FastAPI.** Domain, application, infrastructure, and presentation layers keep the backend testable and portable off AWS if we ever need it.

## Deploy & observability

GitHub Actions deploys through IAM OIDC — no long-lived keys: `aws s3 sync` + CloudFront invalidation for the SPA, `aws lambda update-function-code` for the API. CloudWatch + SNS alarms and AWS Budgets keep cost and health visible.

## Links

- Live site — [kromacompany.com](https://kromacompany.com)
- {{ my_a(link="https://github.com/kromacompanysa", text="Kroma Organization on GitHub") }}
