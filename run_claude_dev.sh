#!/bin/bash
# Claude Code 前端开发任务启动脚本
# 在 ~/projects/leapnode-frontend 内开发，不碰生产、不 push
set -e
cd "$(dirname "$0")"

claude -p "阅读项目根目录的 CLAUDE_TASK.md，按照里面的要求开发 LeapNode 用户前端。务必复用已有的 lib/ 和 components/ui/ 基础设施。先做 P0 页面（首页/登录/注册/控制台/模型市场）+ Header/Footer 布局组件，完成后运行 npx tsc --noEmit 和 npm run build 确保通过，然后 git commit（不要 push）。接着做 P1（商家/官方渠道/钱包/设置），最后 P2 占位页。每个优先级阶段单独 commit。全程中文文案。" \
  --permission-mode acceptEdits \
  --allowedTools "Read,Write,Edit,Bash,Glob,Grep"
