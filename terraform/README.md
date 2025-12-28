# Terraform Infrastructure for DevOps Academy

This directory contains Terraform configuration for provisioning AWS infrastructure.

## 📁 Structure

```
terraform/
├── main.tf                  # Main configuration
├── variables.tf             # Variable definitions
├── terraform.tfvars.example # Example variable values
└── modules/
    ├── vpc/                 # VPC with subnets, NAT gateways
    ├── eks/                 # EKS cluster with node groups
    ├── rds/                 # MySQL RDS instance
    └── s3/                  # S3 bucket for uploads
```

## 🚀 Quick Start

### Prerequisites

1. **Install Terraform**
```bash
# Windows (using Chocolatey)
choco install terraform

# macOS (using Homebrew)
brew install terraform

# Linux
wget https://releases.hashicorp.com/terraform/1.6.0/terraform_1.6.0_linux_amd64.zip
unzip terraform_1.6.0_linux_amd64.zip
sudo mv terraform /usr/local/bin/
```

2. **Configure AWS Credentials**
```bash
aws configure
# Enter your AWS Access Key ID
# Enter your AWS Secret Access Key
# Default region: us-east-1
```

### Deployment Steps

1. **Initialize Terraform**
```bash
cd terraform
terraform init
```

2. **Create terraform.tfvars**
```bash
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your values
```

3. **Plan Infrastructure**
```bash
terraform plan -out=tfplan
```

4. **Apply Changes**
```bash
terraform apply tfplan
```

5. **View Outputs**
```bash
terraform output
```

## 📊 Infrastructure Components

### VPC Module
Creates a complete VPC setup:
- **CIDR**: 10.0.0.0/16
- **Public Subnets**: 3 subnets across 3 AZs
- **Private Subnets**: 3 subnets across 3 AZs
- **NAT Gateways**: 3 (one per AZ for high availability)
- **Internet Gateway**: For public subnet internet access

### EKS Module
Provisions a managed Kubernetes cluster:
- **Cluster Version**: 1.28
- **Node Groups**: Auto-scaling (2-10 nodes)
- **Instance Type**: t3.medium
- **OIDC Provider**: For IAM roles for service accounts
- **CloudWatch Logs**: Enabled for all control plane logs

### RDS Module
Creates a MySQL database:
- **Engine**: MySQL 5.7
- **Instance**: db.t3.micro
- **Storage**: 20 GB (auto-scaling up to 40 GB)
- **Backups**: 7 days retention
- **Encryption**: Enabled
- **Secrets Manager**: Stores credentials securely

### S3 Module
Sets up file storage:
- **Versioning**: Enabled
- **Encryption**: AES256
- **Lifecycle**: Transition to IA after 30 days, Glacier after 90 days
- **CORS**: Configured for web uploads

## 💰 Cost Estimation

| Resource | Monthly Cost (approx.) |
|----------|----------------------|
| EKS Cluster | $73 |
| EC2 Instances (3 x t3.medium) | $94 |
| NAT Gateways (3) | $97 |
| RDS db.t3.micro | $15 |
| S3 Storage (50 GB) | $1 |
| **Total** | **~$280/month** |

> **Cost Optimization Tips:**
> - Use 1 NAT Gateway instead of 3 (-$65/month)
> - Use t3.small instances (-$30/month)
> - Stop cluster when not in use
> - Use Spot instances for non-production

## 🔧 Configuration Options

### Customize VPC
```hcl
vpc_cidr             = "10.1.0.0/16"
public_subnet_cidrs  = ["10.1.1.0/24", "10.1.2.0/24"]
private_subnet_cidrs = ["10.1.11.0/24", "10.1.12.0/24"]
```

### Customize EKS Node Groups
```hcl
eks_node_groups = {
  general = {
    desired_size   = 2
    min_size       = 1
    max_size       = 5
    instance_types = ["t3.small"]
    capacity_type  = "SPOT"  # Use spot instances
  }
  compute = {
    desired_size   = 1
    min_size       = 0
    max_size       = 3
    instance_types = ["c5.large"]
    capacity_type  = "ON_DEMAND"
  }
}
```

## 🔐 Security

### Secrets Management
- Database passwords stored in AWS Secrets Manager
- Access via IAM roles only
- Automatic rotation enabled

### Network Security
- Private subnets for application workloads
- Security groups with least privilege
- No direct internet access for databases

### Best Practices
- ✅ Enable CloudTrail for audit logging
- ✅ Use MFA for AWS console access
- ✅ Regular backup of RDS and S3
- ✅ Monitor costs with AWS Budgets

## 📦 State Management

### Local State (Development)
```bash
# State stored in terraform.tfstate
# DO NOT commit this file to Git
```

### Remote State (Production)
```hcl
# Uncomment in main.tf
terraform {
  backend "s3" {
    bucket         = "devops-academy-terraform-state"
    key            = "prod/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "terraform-state-lock"
  }
}
```

## 🔄 Updating Infrastructure

```bash
# Pull latest changes
git pull

# See what will change
terraform plan

# Apply changes
terraform apply

# Refresh outputs
terraform refresh
```

## 🗑️ Destroying Infrastructure

⚠️ **Warning**: This will delete all resources!

```bash
# Destroy everything
terraform destroy

# Destroy specific resource
terraform destroy -target=module.rds
```

## 🐛 Troubleshooting

### Issue: "Error creating EKS cluster"
```bash
# Check IAM permissions
aws sts get-caller-identity

# Verify region
aws configure get region
```

### Issue: "No available subnets"
```bash
# Check VPC has available IPs
terraform state show module.vpc.aws_vpc.main
```

### Issue: "Resource already exists"
```bash
# Import existing resource
terraform import module.vpc.aws_vpc.main vpc-xxxxx

# Or destroy and recreate
terraform destroy -target=module.vpc
terraform apply
```

## 📚 Additional Resources

- [Terraform AWS Provider Documentation](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [EKS Best Practices](https://aws.github.io/aws-eks-best-practices/)
- [Terraform Best Practices](https://www.terraform-best-practices.com/)

## 🤝 Contributing

1. Test changes in a separate workspace
2. Run `terraform fmt` before committing
3. Run `terraform validate`
4. Document any new variables

## 📧 Support

For issues or questions:
- Open a GitHub issue
- Contact: admin@devopsacademy.com

---

**Note**: Always review `terraform plan` output before applying changes to production!
