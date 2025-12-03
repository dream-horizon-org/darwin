
export LD_LIBRARY_PATH=/usr/java/jdk1.8.0_191-amd64/jre/lib/amd64/server/
source ~/.bashrc
nvm install 16.3.0
nvm use v16.3.0
mvn config:init
source ./.config

npm install -g yarn

echo "Set up bit config"
npm i -g @teambit/bvm
bvm install
export PATH=$HOME/bin:$PATH
bit config 
bit config del user.token 
bit config set user.token $VAULT_SERVICE_BIT_TOKEN
bit config set analytics_reporting false
bit config set anonymous_reporting false
echo "bit latest token $VAULT_SERVICE_BIT_TOKEN"
bit login

echo "Adding bit.dev to npm registry"
echo "always-auth=true" >> ~/.npmrc
echo "@sporta-technology:registry=https://node-registry.bit.cloud" >> ~/.npmrc
echo "@teambit:registry=https://node-registry.bit.cloud" >> ~/.npmrc
echo "//node-registry.bit.cloud/:_authToken=$VAULT_SERVICE_BIT_TOKEN" >> ~/.npmrc
echo "Completed adding bit.dev to npm registry"

yarn
echo "EXECUTING LINT"
yarn lint
echo "NODE_ENV=$dep_env yarn build:production"
NODE_ENV=$dep_env yarn build:production
rm -rf tests
rm -rf node_modules
yarn install --production=true --ignore-scripts
