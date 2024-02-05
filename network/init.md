
```bash
../bin/cryptogen generate --config ./crypto-config.yaml --output=./organizations
```

```bash
../bin/configtxgen -profile EducationNetwork -channelID system-channel -outputBlock ./system-genesis-block/genesis.block
```

```bash
../bin/configtxgen -profile EducationNetwork -outputCreateChannelTx ./channel-artifacts/channel.tx -channelID system-channel
```

```bash
docker-compose up -d
```
