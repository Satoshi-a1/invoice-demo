# 請求書管理デモ (Invoice Management Demo)

請求書を管理する3カラム構成のデモサイトです。ビルド不要の素の HTML/CSS/JS で動作し、請求書データは静的 JSON を「API」として `fetch` で取得します。GitHub Pages にそのまま載せられます。

## 画面構成

| カラム | 内容 |
| --- | --- |
| 左 | 請求書一覧（登録日 / 取引先 / 金額）。行クリックで選択 |
| 中央 | 請求書情報（適格判定・事業者分類・取引先・登録番号・取引年月日・軽減税率・請求金額） |
| 右 | 請求書ビューワー（請求書の見た目を再現したプレビュー） |

## API（静的 JSON）

相対パスで配信されるため、GitHub Pages のサブパスでもそのまま動作します。

| エンドポイント | 説明 | 例 |
| --- | --- | --- |
| `GET api/invoices.json` | 請求書の一覧（サマリ） | 件数・取引先・合計 |
| `GET api/invoices/<id>.json` | 請求書1件の明細 | `api/invoices/inv-0001.json` |

### レスポンス例（明細）

```json
{
  "id": "inv-0001",
  "registeredAt": "2020-05-15T00:00:00",
  "partner": "三三システム株式会社",
  "qualifiedResult": "適格",
  "businessType": "法人",
  "registrationNumber": "T1234567890123",
  "transactionDate": "2020-05-10",
  "reducedTaxRate": "なし",
  "items": [
    { "name": "クラウドサービス利用料", "unitPrice": 30000, "quantity": 1, "amount": 30000 }
  ],
  "subtotal": 48000,
  "tax": 4800,
  "total": 52800
}
```

## ローカルでの動かし方

`fetch` を使うため、ファイルを直接開く（`file://`）のではなく HTTP サーバー経由で開いてください。

```bash
# 例: Python がある場合
python -m http.server 8000
# → http://localhost:8000/ をブラウザで開く
```

## ディレクトリ構成

```
invoice-demo/
├── index.html          # 3カラムの画面
├── css/styles.css      # スタイル
├── js/app.js           # API 取得と描画
└── api/
    ├── invoices.json         # 一覧API
    └── invoices/<id>.json     # 明細API
```

## 備考

- 検索窓やその他メニューは要件どおり省いています。
- データはすべてデモ用の架空のものです。
