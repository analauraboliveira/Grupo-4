#/bin/sh
#Default param is web

PARAM=$1

if [ -z "$PARAM" ]
  then
    PARAM="redmine"
fi

CONTAINER_NAME=$(docker inspect -f '{{.Name}}' $(docker-compose ps -q $PARAM) | cut -c2- | grep -v "_run_")

echo "After attached, to exit press CTRL+P and after, CTRL+Q"

echo "Trying to attach to $PARAM container..."

docker attach $CONTAINER_NAME