#!/bin/bash

# パッケージ名を指定
name="World_Owner"
version="1.0.0"

# packageフォルダの削除
rm -rf ./package

# ディレクトリの作成
mkdir -p ./package

# package フォルダ内にコピー
cp -r ./World_Owner_BP ./World_Owner_RP ./package

# ディレクトリの移動
cd ./package

# mcpackの作成
zip -r ${name}_${version}.zip ./*

# 名前の変更
mv ${name}_${version}.zip ${name}_${version}.mcaddon

# package フォルダの削除
rm -rf ./World_Owner_BP ./World_Owner_RP

echo
echo "Make package successful!"
echo
