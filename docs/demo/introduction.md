# SIS Copilot 拡張機能ガイド（現状の機能と制限）
この拡張機能は、**開発者の補助ツール**として機能し、完全な自動化ソリューションではありません。効果的に活用するには、AIの提案を適切に評価し、プロジェクトの文脈に沿って応用することが重要です。

## 現在できること

### コード理解・分析
- 既存コードの説明と解説
- コードレビューと改善提案
- プロジェクト構造の分析
- エラーメッセージの解析と修正提案
- コードベースの検索と関連コードの発見

### 開発支援
- インラインコード補完
- テストコードの生成
- ドキュメントの生成
- コミットメッセージの生成
- TODOタスク管理

### エージェントによる専門的支援
- **コードレビューエージェント**: アーキテクチャと設計の観点からのレビュー
- **テスト生成エージェント**: プロジェクトの規約に沿ったテストコードの生成
- **診断エージェント**: エラーの詳細な分析と修正提案
- **メンターエージェント**: コードの説明と実装ガイダンス

## 現在できないこと

### 実装の制限
- ✖ 複雑な機能の完全自動実装
- ✖ 大規模なリファクタリングの自動実行
- ✖ 複数ファイルの同時編集

### AIモデルの制限
- GPT-4oの知識は2024年4月までに制限
- 長いコードセッションでのコンテキスト維持が限定的

| Model   | MMLU (Undergraduate level knowledge) | GPQA (Graduate level reasoning) | MATH (Math Problem-solving) | HumanEval (Code) | MGSM (Multilingual Math) | DROP (Reasoning over text) |
|---------|------|-----|----|------|-------|---------|
| GPT-4o  | 88.7    | 53.6     | 76.6  | 90.2    | 90.5    | 83.4   |

[Benchmark Results](https://github.com/openai/simple-evals?tab=readme-ov-file#benchmark-results)


## 効果的な活用方法

### ✅ 推奨される使い方

1. **学習とガイダンス**
```markdown
Good:
- 「このパターンの利点と欠点を説明してください」
- 「この実装方法の背景にある考え方を教えてください」
- 「このコードをより良くする方法のアドバイスをください」

Bad:
- 「このコードを書いてください」
- 「この機能を実装してください」
```

2. **コード理解の促進**
```markdown
Good:
- 「このコードがなぜこのように設計されているか説明してください」
- 「このパターンの使用例と使用すべき状況を教えてください」
- 「このコードの潜在的な問題点を指摘してください」

Bad:
- 「このコードを別の方法で書き直してください」
- 「これをもっと簡単に実装する方法を示してください」
```

3. **問題解決のガイド**
```markdown
Good:
- 「このエラーの原因と考えられる要因を説明してください」
- 「この問題に対する複数のアプローチとそれぞれの特徴を教えてください」
- 「このパフォーマンス問題を診断する手順を示してください」

Bad:
- 「このバグを修正してください」
- 「パフォーマンスを改善するコードを書いてください」
```

### 学習と成長のためのベストプラクティス

1. **対話的な学習**
   - 質問を重ねて理解を深める
   - 提案された解決策の理由を確認
   - 異なるアプローチの比較検討

2. **段階的な理解**
   - 大きな問題を小さな部分に分解
   - 各部分について詳細な説明を求める
   - 理解した内容を実際に適用

3. **知識の内在化**
   - 説明を受けた内容を自分の言葉で整理
   - 学んだパターンを他の場面に応用
   - 理解した内容をチームと共有

## エージェントの活用方法

### メンターエージェント
- コードの背景にある原理原則の説明を求める
- 設計判断の理由を理解する
- より良い実装方法についてのアドバイスを得る

### コードレビューエージェント
- コードの品質向上のポイントを学ぶ
- アーキテクチャ設計の考え方を理解する
- セキュリティやパフォーマンスの観点を学ぶ

### 診断エージェント
- 問題解決のアプローチを学ぶ
- デバッグの手法を理解する
- エラーパターンとその対処法を学ぶ

### テスト生成エージェント
- テスト設計の考え方を学ぶ
- テストケースの作成方法を理解する
- テストの網羅性を高める方法を学ぶ

## 重要な心構え

1. **主体性の維持**
   - AIは助言者であり、決定者ではない
   - 提案は必ず自分で評価し理解する
   - チームの方針や要件を常に優先する

2. **継続的な学習**
   - // AIとの対話を通じて知識を蓄積
   - 理解したことを実践に活かす
   - 新しい視点や方法を積極的に探求

3. **責任ある開発**
   - セキュリティと品質は開発者の責任
   - 生成されたコードは必ず理解してから使用
   - チームメンバーとの協力を大切に




# SIS-Copilot ベストプラクティスガイド

## 1. プロジェクト設定のベストプラクティス

### 1.1 効果的なドキュメント構成
```markdown
/your-project
├── docs/
│   ├── architecture/
│   │   ├── system-overview.md
│   │   ├── database-design.md
│   │   └── api-design.md
│   ├── requirements/
│   │   ├── functional-requirements.md
│   │   └── non-functional-requirements.md
│   └── guidelines/
│       ├── coding-standards.md
│       └── testing-guidelines.md
```

### 1.2 理想的なドキュメント例
```markdown
# API設計ドキュメント

## 概要
このAPIは注文管理システムのバックエンドを提供します。

## エンドポイント
### POST /api/orders
注文を作成します。

#### リクエスト仕様
```json
{
    "customerId": "string",
    "items": [
        {
            "productId": "string",
            "quantity": number
        }
    ]
}
```

#### バリデーションルール
- customerIdは必須
- itemsは最低1つ必要
```

## 2. エージェントとの効果的な対話例

### 2.1 コードレビュー依頼
```markdown
✅ 良い例：
「このReactコンポーネントのパフォーマンスとセキュリティの観点からレビューをお願いします。
特に状態管理とユーザー入力の処理に注目してください。」

❌ 避けるべき例：
「このコードをレビューしてください」
```

### 2.2 テスト生成依頼
```markdown
✅ 良い例：
「この認証サービスのユニットテストを生成してください。
以下のシナリオのテストが必要です：
- ユーザーログイン成功
- パスワード不一致
- アカウントロック
- レート制限」

❌ 避けるべき例：
「テストを書いてください」
```

## 3. 具体的なユースケース別ベストプラクティス

### 3.1 新機能開発
```markdown
1. 要件分析フェーズ
質問例：
「新しい注文管理機能の実装について、以下の要件に基づいて
アーキテクチャ設計のアドバイスをお願いします：
- 1日10万オーダーの処理
- 99.9%の可用性要件
- データ整合性の保証」

2. 実装フェーズ
質問例：
「以下のインターフェースに基づいて、
OrderServiceの基本実装を提案してください：

```typescript
interface OrderService {
    createOrder(order: Order): Promise<OrderResult>;
    updateStatus(orderId: string, status: OrderStatus): Promise<void>;
    getOrderDetails(orderId: string): Promise<OrderDetails>;
}
```

3. テストフェーズ
質問例：
「実装したOrderServiceの単体テストを生成してください。
特に注文作成時の在庫チェックとロールバックのケースを
重点的にテストしたいです」
```

### 3.2 バグ修正
```markdown
1. 問題分析
質問例：
「以下のエラーログとスタックトレースを分析して、
考えられる原因と影響範囲を教えてください：

```log
TypeError: Cannot read property 'items' of undefined
    at OrderProcessor.validateItems (/src/services/order.ts:45)
    at OrderProcessor.process (/src/services/order.ts:23)
```

2. 修正案の検討
質問例：
「このNullPointerExceptionを防ぐため、
以下の箇所にNull安全な実装を提案してください。
特にTypeScriptの型システムを活用した解決策を希望します」
```

### 3.3 パフォーマンス最適化
```markdown
1. 問題特定
質問例：
「このAPIエンドポイントのレスポンスタイムが遅い原因を
分析してください。特に以下の点に注目をお願いします：
- N+1クエリの可能性
- インデックスの使用状況
- キャッシュの活用機会」

2. 改善実装
質問例：
「以下のクエリのパフォーマンスを改善するため、
適切なインデックスとクエリの最適化を提案してください：

```sql
SELECT o.*, c.name, p.details
FROM orders o
JOIN customers c ON o.customer_id = c.id
JOIN products p ON o.product_id = p.id
WHERE o.status = 'pending'
AND o.created_at > '2024-01-01'
```
```

## 4. コード生成とレビューの組み合わせ

### 4.1 段階的な開発アプローチ
```markdown
1. 基本実装の生成
質問例：
「TypeScriptで簡単なユーザー認証クラスを
実装してください。JWT認証を使用し、
以下の機能が必要です：
- ログイン処理
- トークン検証
- リフレッシュトークン管理」

2. コードレビューの依頼
質問例：
「生成されたコードについて、
セキュリティの観点から以下の点を
レビューしてください：
- トークンの有効期限設定
- パスワードハッシュ化の方法
- リフレッシュトークンの安全性」

3. テストケースの生成
質問例：
「レビュー後の実装に対する
セキュリティテストケースを生成してください。
特に以下のシナリオをカバーしてください：
- 不正なトークンの検出
- トークン有効期限切れの処理
- リフレッシュトークンの再利用防止」
```

### 4.2 コードベースの理解促進
```markdown
質問例：
「このプロジェクトの認証フローについて、
以下の観点から説明をお願いします：
- アーキテクチャの概要
- 主要なコンポーネントの役割
- セキュリティ対策の実装」
```

## 5. チーム開発でのベストプラクティス

### 5.1 知識共有
```markdown
1. コードドキュメンテーション
質問例：
「この認証モジュールの使用方法と
注意点をまとめたMarkdownドキュメントを
生成してください」

2. レビューコメント
質問例：
「このPRに対する建設的なレビューコメントを
生成してください。特に：
- コードの保守性
- エラーハンドリング
- テストカバレッジ
の観点からコメントをお願いします」
```

### 5.2 標準化と品質管理
```markdown
1. コーディング規約の適用
質問例：
「このTypeScriptコードを
プロジェクトのコーディング規約に
準拠するように修正してください：
- 命名規則
- ファイル構成
- エラーハンドリング
の観点を重視してお願いします」

2. レビューチェックリスト
質問例：
「このプロジェクトのコードレビューで
使用する包括的なチェックリストを
生成してください」
```

これらのベストプラクティスは、プロジェクトの要件や状況に応じて適宜調整してください。効果的な使用のためには、チーム内で統一された使用方法を確立することが重要です。