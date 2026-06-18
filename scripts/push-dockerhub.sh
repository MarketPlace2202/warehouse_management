#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   DOCKERHUB_USERNAME=yourusername ./scripts/push-dockerhub.sh
#
# Or export your username first:
#   export DOCKERHUB_USERNAME=marketplace2202

DOCKERHUB_USERNAME="${DOCKERHUB_USERNAME:-marketplace2202}"
IMAGE_NAME="${IMAGE_NAME:-warehouse-backend}"
TAG="${TAG:-latest}"

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "Building ${DOCKERHUB_USERNAME}/${IMAGE_NAME}:${TAG} ..."
cd "${ROOT_DIR}/backend"
DOCKER_BUILDKIT=0 docker build \
  -t "${DOCKERHUB_USERNAME}/${IMAGE_NAME}:${TAG}" \
  -t "${DOCKERHUB_USERNAME}/${IMAGE_NAME}:1.0.0" \
  .

echo "Logging in to Docker Hub (if not already logged in) ..."
docker login

echo "Pushing image ..."
docker push "${DOCKERHUB_USERNAME}/${IMAGE_NAME}:${TAG}"
docker push "${DOCKERHUB_USERNAME}/${IMAGE_NAME}:1.0.0"

echo ""
echo "Done! Use this link in your submission form:"
echo "https://hub.docker.com/r/${DOCKERHUB_USERNAME}/${IMAGE_NAME}"
