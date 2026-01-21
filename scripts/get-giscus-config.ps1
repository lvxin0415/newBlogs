# 获取 Giscus 配置参数 (PowerShell 版本)
# 使用方法: .\get-giscus-config.ps1 -Owner "lvxin0415" -Repo "newBlogs"

param(
    [string]$Owner = "lvxin0415",
    [string]$Repo = "newBlogs"
)

Write-Host "🔍 正在获取 $Owner/$Repo 的配置参数...`n" -ForegroundColor Cyan

# 检查是否安装了 gh CLI
if (!(Get-Command gh -ErrorAction SilentlyContinue)) {
    Write-Host "❌ 未找到 GitHub CLI (gh)" -ForegroundColor Red
    Write-Host "请安装: https://cli.github.com/" -ForegroundColor Yellow
    Write-Host "`n或者直接访问: https://giscus.app/zh-CN`n" -ForegroundColor Yellow
    exit 1
}

# 获取 repo-id
Write-Host "📦 获取 Repository ID..." -ForegroundColor Green

$repoQuery = @"
{
  repository(owner: \"$Owner\", name: \"$Repo\") {
    id
    isPrivate
    hasDiscussionsEnabled
  }
}
"@

try {
    $repoResult = gh api graphql -f query="$repoQuery" | ConvertFrom-Json
    $repoId = $repoResult.data.repository.id
    $isPrivate = $repoResult.data.repository.isPrivate
    $hasDiscussions = $repoResult.data.repository.hasDiscussionsEnabled

    Write-Host "✅ Repository ID: $repoId`n" -ForegroundColor Green

    # 检查仓库状态
    if ($isPrivate) {
        Write-Host "⚠️  警告: 仓库是私有的，giscus 需要公开仓库" -ForegroundColor Yellow
    }

    if (-not $hasDiscussions) {
        Write-Host "⚠️  警告: 未启用 Discussions 功能" -ForegroundColor Yellow
        Write-Host "   请在仓库 Settings → Features 中启用 Discussions`n" -ForegroundColor Yellow
    }

    # 获取 category-id
    Write-Host "📂 获取 Discussion Categories..." -ForegroundColor Green

    $categoryQuery = @"
{
  repository(owner: \"$Owner\", name: \"$Repo\") {
    discussionCategories(first: 20) {
      nodes {
        id
        name
        description
      }
    }
  }
}
"@

    $categoryResult = gh api graphql -f query="$categoryQuery" | ConvertFrom-Json
    $categories = $categoryResult.data.repository.discussionCategories.nodes

    Write-Host "✅ 可用的分类:`n" -ForegroundColor Green
    
    foreach ($category in $categories) {
        Write-Host "  📁 $($category.name)" -ForegroundColor Cyan
        Write-Host "     ID: $($category.id)" -ForegroundColor Gray
        if ($category.description) {
            Write-Host "     说明: $($category.description)" -ForegroundColor Gray
        }
        Write-Host ""
    }

    # 输出配置
    Write-Host "================================================" -ForegroundColor Magenta
    Write-Host "📋 你的 Giscus 配置参数：" -ForegroundColor Magenta
    Write-Host "================================================`n" -ForegroundColor Magenta

    Write-Host "data-repo=`"$Owner/$Repo`"" -ForegroundColor White
    Write-Host "data-repo-id=`"$repoId`"" -ForegroundColor White
    Write-Host "data-category=`"Announcements`"  # 从上面选择" -ForegroundColor White
    
    # 查找 Announcements 分类
    $announcementsCategory = $categories | Where-Object { $_.name -eq "Announcements" }
    if ($announcementsCategory) {
        Write-Host "data-category-id=`"$($announcementsCategory.id)`"  # Announcements" -ForegroundColor White
    } else {
        Write-Host "data-category-id=`"DIC_kwDO...`"  # 对应分类的 ID" -ForegroundColor White
    }

    Write-Host "`n================================================`n" -ForegroundColor Magenta

    Write-Host "💡 提示:" -ForegroundColor Yellow
    Write-Host "1. 确保已安装 giscus app: https://github.com/apps/giscus" -ForegroundColor Gray
    Write-Host "2. 或直接访问配置页面: https://giscus.app/zh-CN`n" -ForegroundColor Gray

    # 复制到剪贴板（可选）
    $config = @"
data-repo="$Owner/$Repo"
data-repo-id="$repoId"
data-category="Announcements"
data-category-id="$($announcementsCategory.id)"
"@

    Write-Host "📋 配置已复制到剪贴板！" -ForegroundColor Green
    Set-Clipboard -Value $config

} catch {
    Write-Host "`n❌ 获取失败，请检查:" -ForegroundColor Red
    Write-Host "  1. 仓库名是否正确" -ForegroundColor Yellow
    Write-Host "  2. 是否有访问权限" -ForegroundColor Yellow
    Write-Host "  3. 是否已登录 GitHub CLI (gh auth login)`n" -ForegroundColor Yellow
    Write-Host "错误详情: $_" -ForegroundColor Red
    exit 1
}
