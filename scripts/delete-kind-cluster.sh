#!/bin/bash

# 🗑️ DevOps Academy - Cleanup Script
# This script deletes the Kind cluster

set -e

echo "🗑️ Deleting Kind cluster..."

# Delete cluster
kind delete cluster --name devops-academy

echo "✅ Cluster deleted successfully!"
echo ""
echo "To recreate the cluster, run:"
echo "./scripts/create-kind-cluster.sh"
