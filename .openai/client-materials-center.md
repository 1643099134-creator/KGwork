# 客户资料中心

入口 `/client-portals?team=…`；客户只读入口 `/client/<64位随机token>`。

## 存储与生命周期

- 文件原件继续存于 R2，D1 记录文件 metadata、权限、版本、整理状态和看板配置。前端不包含文件原件、Base64 或数据库对象位置。
- `/files` 工作文件 → 系列整理、确认有效 → `/files?view=final` 正式资料库（final / archived）→ 看板选入 → 保存草稿 → 确认发布。
- 看板保存的是同一不可变文件原件的引用，不重复上传、不嵌入网页。发布快照保存在 D1，与草稿隔离；修改草稿或源文件状态不会自动替换客户端已发布资料。撤回发布资料应停用看板；移入内部回收站不会撤回已发布看板。
- 旧 kege-portal.pages.dev 页面声明仅保存于本机浏览器。本实现没有导入其浏览器文件；需导出真实原件后从现有上传入口录入云端，再整理确认。

## 权限与客户访问

- 管理员可管理当前团队全部看板；分类授权整理人可管理自己建立的看板，且每次保存/发布逐个校验文件访问权限、有效状态和分类授权。普通成员/只读成员不能创建或发布。
- 每个看板使用独立随机 token；支持访问码（至少6字符，SHA-256 salted with token）、有效期、可选下载、停用和停用后轮换分享地址。
- public endpoint 不依赖团队会话，访问码换取 HttpOnly SameSite cookie；授权绑定当前 token、code hash、发布时间。文件端点与列表共用验证；仅允许快照中的序号，服务端不公开 R2 keys 或源任务标识。
- 访问码每 token/IP/15分钟最多10次，D1 counters；所有管理写入采用 version CAS。
- preview 读取 R2 原件；Office 是可提取文本预览；HTML 使用无 scripts、无 same-origin 的 sandbox/CSP 安全预览，互动 HTML 的脚本不运行。未知格式只允许开启下载后获取。
- “仅预览”不等同于内容防复制；用户浏览器已读取的资料与已下载副本不能远程收回。

## 验证

`.sites-runtime/test-client-portals.cjs` 在真实 SQLite schema / mock R2 上验证匿名/成员/授权范围、有效版限定、草稿隔离、版本冲突、code gate、下载控制、文件范围、停用/轮换/过期及限速。现有 broad ACL suite 保留。

只新增 `0016_client_portals`；既有迁移不可修改。
