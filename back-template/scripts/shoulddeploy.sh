response=$(curl -s 'https://shouldideploy.today/api?tz=America/Sao_Paulo' | jq -r '.shouldideploy, .message')
SDT=$(echo "$response" | head -n 1)
WHY=$(echo "$response" | tail -n 1)

echo "$WHY"

if [ "$SDT" = "true" ]
then
  echo 'Deploy!'
  exit 0
else
  echo 'Not deploy!'
  exit 1
fi
