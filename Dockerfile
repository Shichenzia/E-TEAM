from node

maintainer leansocket

workdir /workspace
copy . /workspace

expose 80

run mkdir /workspace/logs
run npm install

cmd npm run prod
