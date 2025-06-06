# دليل نظام الإصدارات

## مقدمة

يستخدم مشروع NeuroNest-AI نظام الإصدارات الدلالي (Semantic Versioning) لتتبع التغييرات والتحديثات بطريقة منظمة ومفهومة. هذا الدليل يشرح كيفية استخدام نظام الإصدارات في المشروع وكيفية المساهمة بالتحديثات.

## نظام الإصدارات الدلالي (Semantic Versioning)

نستخدم تنسيق `vX.Y.Z` حيث:

- **X**: رقم الإصدار الرئيسي (MAJOR) - يتم زيادته عند إجراء تغييرات غير متوافقة مع الإصدارات السابقة.
- **Y**: رقم الإصدار الثانوي (MINOR) - يتم زيادته عند إضافة وظائف جديدة بطريقة متوافقة مع الإصدارات السابقة.
- **Z**: رقم الإصدار الفرعي (PATCH) - يتم زيادته عند إجراء إصلاحات للأخطاء بطريقة متوافقة مع الإصدارات السابقة.

### أمثلة:

- `v0.1.0`: الإصدار الأولي للمشروع.
- `v0.1.1`: إصلاحات أخطاء بسيطة.
- `v0.2.0`: إضافة ميزات جديدة.
- `v1.0.0`: إصدار مستقر وجاهز للاستخدام العام.
- `v2.0.0`: تغييرات كبيرة غير متوافقة مع الإصدارات السابقة.

## إرشادات تحديث الإصدارات

### متى تقوم بزيادة رقم الإصدار الرئيسي (MAJOR):

- عند إجراء تغييرات تكسر التوافق مع الإصدارات السابقة.
- عند تغيير واجهات البرمجة (APIs) بشكل جذري.
- عند إعادة هيكلة كبيرة للمشروع.

### متى تقوم بزيادة رقم الإصدار الثانوي (MINOR):

- عند إضافة ميزات جديدة.
- عند تحسين الأداء بشكل ملحوظ.
- عند إضافة واجهات برمجة جديدة مع الحفاظ على التوافق مع الإصدارات السابقة.

### متى تقوم بزيادة رقم الإصدار الفرعي (PATCH):

- عند إصلاح الأخطاء.
- عند إجراء تحسينات طفيفة.
- عند تحديث التوثيق.

## عملية إصدار نسخة جديدة

1. **تحديث ملف CHANGELOG.md**:
   - أضف قسمًا جديدًا في أعلى الملف بعنوان `## Version X.Y.Z - YYYY-MM-DD`.
   - اذكر جميع التغييرات المهمة تحت هذا العنوان.
   - استخدم الفئات التالية لتنظيم التغييرات:
     - `Added`: للميزات الجديدة.
     - `Changed`: للتغييرات في الوظائف الحالية.
     - `Deprecated`: للميزات التي سيتم إزالتها في الإصدارات المستقبلية.
     - `Removed`: للميزات التي تمت إزالتها.
     - `Fixed`: لإصلاحات الأخطاء.
     - `Security`: للتحسينات الأمنية.

2. **تحديث رقم الإصدار في الملفات ذات الصلة**:
   - `package.json` في مجلدات `frontend` و `backend`.
   - أي ملفات أخرى تحتوي على رقم الإصدار.

3. **إنشاء علامة (Tag) في Git**:
   ```bash
   git tag -a vX.Y.Z -m "Version X.Y.Z"
   git push origin vX.Y.Z
   ```

4. **إنشاء إصدار في GitHub**:
   - انتقل إلى صفحة "Releases" في مستودع GitHub.
   - انقر على "Draft a new release".
   - اختر العلامة (Tag) التي أنشأتها.
   - أضف عنوانًا للإصدار (عادة ما يكون رقم الإصدار).
   - انسخ محتوى التغييرات من CHANGELOG.md.
   - انقر على "Publish release".

## إرشادات للمساهمين

إذا كنت تساهم في المشروع، يرجى اتباع هذه الإرشادات:

1. **فروع التطوير**:
   - استخدم فروعًا منفصلة لكل ميزة أو إصلاح.
   - سمِّ الفروع بطريقة وصفية، مثل `feature/auth-system` أو `fix/login-bug`.

2. **رسائل الالتزام (Commit Messages)**:
   - اكتب رسائل التزام واضحة ووصفية.
   - استخدم صيغة الأمر، مثل "Add feature" بدلاً من "Added feature".
   - اذكر رقم المشكلة (Issue) إذا كان ذلك مناسبًا.

3. **طلبات السحب (Pull Requests)**:
   - اشرح التغييرات التي قمت بها بالتفصيل.
   - اذكر أي تغييرات في واجهات البرمجة (APIs).
   - اذكر ما إذا كانت التغييرات تتطلب زيادة في رقم الإصدار الرئيسي أو الثانوي أو الفرعي.

## الخلاصة

اتباع نظام الإصدارات الدلالي يساعد في تنظيم تطوير المشروع وتسهيل فهم التغييرات للمستخدمين والمطورين. يرجى الالتزام بهذه الإرشادات للحفاظ على تناسق وجودة المشروع.