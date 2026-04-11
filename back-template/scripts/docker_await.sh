for i in $(seq 1 60)
do
  docker info > /dev/null 2>&1 && exit 0 || echo 'Waiting for docker to start'
  sleep 1s
done
exit 1