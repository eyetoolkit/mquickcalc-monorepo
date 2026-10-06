# AdSense 接入指南（mQuickCalc 网络）

本仓库的工具页已预留好广告位容器，**默认不可见**——只有当里面被填入真实的 AdSense
`<ins>` 代码后才会显示。这样在 AdSense 审核通过前，线上不会出现空白框或占位文字。

## 广告位布局（已在 build 时注入每个 HTML 页）

| `data-ad` | 位置 | 尺寸建议 | 价值 |
|-----------|------|----------|------|
| `header`  | 顶栏正下方通栏（位①） | 728×90 / 响应式 | 高曝光 |
| `incontent` | 正文首个 `<h2>` 之前（位②） | 300×250 / 336×280 | **最高 RPM** |
| `mobile`  | 移动端固定底栏（位④，≤768px） | 320×50 | 移动流量变现 |

> 所有容器在 `packages/brand-kit/css/site.css` 的 `.ad-slot*` 规则中定义（构建时同步到 4 个子站）。

## 接入步骤

1. 在 [AdSense](https://www.google.com/adsense/) 用同一个发布商账号添加 4 个站点：
   `mquickcalc.com` / `finance.mquickcalc.com` / `health.mquickcalc.com` / `cover.mquickcalc.com`
   （或用主域的「站点授权」一次覆盖全子域）。
2. 获取 **AdSense 代码**（含你的 `data-ad-client="ca-pub-XXXX"` 和 `data-ad-slot="YYYY"`）。
3. 把 `<ins>` 标签粘贴进对应容器。例如正文广告位②：

   ```html
   <!-- 原来（空容器，用户看不到） -->
   <div class="ad-slot ad-incontent" data-ad="incontent"></div>

   <!-- 改为（填入 AdSense 代码后自动显示） -->
   <div class="ad-slot ad-incontent" data-ad="incontent">
     <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXX"
             crossorigin="anonymous"></script>
     <ins class="adsbygoogle"
          style="display:block"
          data-ad-client="ca-pub-XXXX"
          data-ad-slot="YYYY"
          data-ad-format="auto"
          data-full-width-responsive="true"></ins>
     <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
   </div>
   ```

   顶栏（位①）和移动底栏（位④）同理，填入各自的 `data-ad-slot`。

4. 提交并 `git push`，GitHub Actions 自动重新构建部署。新广告通常在审核通过后数小时内开始展示。

## 注意事项

- **不要**在 AdSense 审核通过前手动填入假代码——空容器是预期状态。
- 容器已预留 `min-height` 防止广告异步加载时页面跳动（CLS）。
- 想临时预览广告位在页面上的位置：在 `site.css` 里给 `.ad-slot{display:block}` 临时覆盖，
  或给空容器加一个 `<div class="ad-label">Advertisement</div>` 占位，上线前删掉即可。
- 移动底栏使用了 `body:has(.ad-sticky-mobile:not(:empty))` 来预留底部空间，
  需要较新的浏览器（2023+ 已广泛支持）。
