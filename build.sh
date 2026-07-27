set -e

# NODE_ENV=$([ "$BRANCH" == "main" ] && echo $PROD_RESTART_COMMAND || echo $DEV_RESTART_COMMAND)

echo "Building image"

docker build \
       --platform linux/amd64 \
       -t otb_admin \
       --no-cache \
       .

echo "Logging in to AWS"
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 310867200447.dkr.ecr.us-east-1.amazonaws.com
echo "Logged in successfully"

echo "Tagging image with latest"
docker tag otb_admin 310867200447.dkr.ecr.us-east-1.amazonaws.com/otb_admin:latest

echo "Pushing image"
docker push 310867200447.dkr.ecr.us-east-1.amazonaws.com/otb_admin:latest

echo "Force update service"
aws ecs update-service --cluster otb-admin --service otb-admin --force-new-deployment --region us-east-1