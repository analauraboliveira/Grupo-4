#!/bin/bash

CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)

echo "Deploying from '$CURRENT_BRANCH' to homolog"

git push origin "$CURRENT_BRANCH":homolog --force

