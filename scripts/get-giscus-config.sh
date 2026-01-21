#!/bin/bash

# 获取 Giscus 配置参数
# 使用方法: ./get-giscus-config.sh 你的用户名 仓库名

OWNER=${1:-"lvxin0415"}
REPO=${2:-"newBlogs"}

echo "🔍 正在获取 $OWNER/$REPO 的配置参数..."
echo ""

# 检查是否安装了 gh CLI
if ! command -v gh &> /dev/null; then
    echo "❌ 未找到 GitHub CLI (gh)"
    echo "请安装: https://cli.github.com/"
    echo ""
    echo "或者直接访问: https://giscus.app/zh-CN"
    exit 1
fi

# 获取 repo-id
echo "📦 获取 Repository ID..."
REPO_QUERY=$(cat <<EOF
{
  repository(owner: "$OWNER", name: "$REPO") {
    id
    isPrivate
    hasDiscussionsEnabled
  }
}
EOF
)

REPO_RESULT=$(gh api graphql -f query="$REPO_QUERY" 2>&1)

if [ $? -ne 0 ]; then
    echo "❌ 获取失败，请检查:"
    echo "  1. 仓库名是否正确"
    echo "  2. 是否有访问权限"
    echo "  3. 是否已登录 GitHub CLI (gh auth login)"
    exit 1
fi

REPO_ID=$(echo "$REPO_RESULT" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
IS_PRIVATE=$(echo "$REPO_RESULT" | grep -o '"isPrivate":[^,}]*' | cut -d':' -f2)
HAS_DISCUSSIONS=$(echo "$REPO_RESULT" | grep -o '"hasDiscussionsEnabled":[^,}]*' | cut -d':' -f2)

echo "✅ Repository ID: $REPO_ID"
echo ""

# 检查仓库状态
if [ "$IS_PRIVATE" == "true" ]; then
    echo "⚠️  警告: 仓库是私有的，giscus 需要公开仓库"
fi

if [ "$HAS_DISCUSSIONS" == "false" ]; then
    echo "⚠️  警告: 未启用 Discussions 功能"
    echo "   请在仓库 Settings → Features 中启用 Discussions"
fi

# 获取 category-id
echo "📂 获取 Discussion Categories..."
CATEGORY_QUERY=$(cat <<EOF
{
  repository(owner: "$OWNER", name: "$REPO") {
    discussionCategories(first: 20) {
      nodes {
        id
        name
        description
      }
    }
  }
}
EOF
)

CATEGORY_RESULT=$(gh api graphql -f query="$CATEGORY_QUERY" 2>&1)

echo "✅ 可用的分类:"
echo ""
echo "$CATEGORY_RESULT" | grep -E '"(id|name)":' | sed 's/.*"id":"\([^"]*\)".*/\1/;s/.*"name":"\([^"]*\)".*/  📁 \1/' | paste - - | column -t

echo ""
echo "================================================"
echo "📋 你的 Giscus 配置参数："
echo "================================================"
echo ""
echo "data-repo=\"$OWNER/$REPO\""
echo "data-repo-id=\"$REPO_ID\""
echo "data-category=\"Announcements\"  # 从上面选择"
echo "data-category-id=\"DIC_kwDO...\"  # 对应分类的 ID"
echo ""
echo "================================================"
echo ""
echo "💡 提示:"
echo "1. 确保已安装 giscus app: https://github.com/apps/giscus"
echo "2. 或直接访问配置页面: https://giscus.app/zh-CN"
echo ""
