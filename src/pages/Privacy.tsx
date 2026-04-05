import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function Privacy() {
  const navigate = useNavigate()

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Radad" className="w-8 h-8 rounded-lg" />
            <span className="font-bold text-lg text-gray-900">رداد للذكاء الاصطناعي</span>
          </div>
          <button onClick={() => navigate('/')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
            الرئيسية <ArrowLeft size={16} />
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto py-10 px-4">
        <div className="bg-white rounded-2xl shadow-sm p-8 md:p-12">
          {/* Title */}
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">سياسة الخصوصية</h1>
            <p className="text-lg text-gray-500">Privacy Policy</p>
            <p className="text-sm text-gray-400 mt-2">آخر تحديث: أبريل 2026 | Last updated: April 2026</p>
          </div>

          <div className="space-y-8 text-gray-700 leading-relaxed">
            {/* 1. Introduction */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">1. مقدمة</h2>
              <p>
                مرحباً بك في <strong>رداد للذكاء الاصطناعي</strong> ("رداد"، "نحن"، "خدمتنا")، وهي منصة مملوكة ومشغّلة من قبل
                <strong> مؤسسة سمارتك لتقنية المعلومات</strong> (سجل تجاري رقم: __________)، المملكة العربية السعودية.
              </p>
              <p className="mt-3">
                نحن نحترم خصوصيتك ونلتزم بحماية بياناتك الشخصية وفقاً لـ<strong>نظام حماية البيانات الشخصية السعودي (PDPL)</strong>
                والأنظمة واللوائح ذات الصلة الصادرة عن الهيئة السعودية للبيانات والذكاء الاصطناعي (سدايا).
                توضح هذه السياسة كيفية جمع واستخدام وتخزين وحماية وحذف المعلومات التي نحصل عليها عند استخدامك لخدماتنا.
              </p>
              <p className="mt-3 text-sm text-gray-500">
                We respect your privacy and are committed to protecting your personal data in accordance with the Saudi
                Personal Data Protection Law (PDPL) and related regulations issued by SDAIA.
              </p>
            </section>

            {/* 2. Data Controller */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">2. المسؤول عن معالجة البيانات</h2>
              <div className="bg-gray-50 rounded-xl p-4 text-sm">
                <p><strong>الجهة:</strong> مؤسسة سمارتك لتقنية المعلومات</p>
                <p className="mt-1"><strong>العنوان:</strong> المملكة العربية السعودية</p>
                <p className="mt-1"><strong>البريد الإلكتروني:</strong> <a href="mailto:privacy@radadai.com" className="text-emerald-600 hover:underline">privacy@radadai.com</a></p>
                <p className="mt-1"><strong>موقع الخدمة:</strong> <a href="https://stores.radadai.com" className="text-emerald-600 hover:underline">stores.radadai.com</a></p>
              </div>
            </section>

            {/* 3. Data We Collect */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">3. البيانات التي نجمعها</h2>
              <p className="mb-4">نجمع الأنواع التالية من البيانات عند استخدامك لخدماتنا:</p>

              <div className="space-y-4">
                <div className="bg-blue-50 border-r-4 border-blue-400 rounded-lg p-4">
                  <p className="font-semibold text-blue-900 mb-1">أ. بيانات الحساب والتسجيل</p>
                  <p className="text-blue-800 text-sm">
                    الاسم الكامل، البريد الإلكتروني، رقم الجوال، اسم المتجر، نوع النشاط التجاري، وكلمة المرور (مشفرة).
                  </p>
                </div>

                <div className="bg-green-50 border-r-4 border-green-400 rounded-lg p-4">
                  <p className="font-semibold text-green-900 mb-1">ب. بيانات المتجر والمنتجات</p>
                  <p className="text-green-800 text-sm">
                    معلومات المنتجات (الاسم، الوصف، السعر، التصنيف)، محتوى قاعدة المعرفة (الأسئلة والأجوبة)،
                    وإعدادات الذكاء الاصطناعي (النبرة، اللغة، التعليمات).
                  </p>
                </div>

                <div className="bg-purple-50 border-r-4 border-purple-400 rounded-lg p-4">
                  <p className="font-semibold text-purple-900 mb-1">ج. بيانات المحادثات والعملاء</p>
                  <p className="text-purple-800 text-sm">
                    الرسائل المتبادلة بين عملائك والذكاء الاصطناعي عبر واتساب وإنستقرام وتيليقرام،
                    أرقام هواتف العملاء، أسماء العملاء (كما تظهر في الملف الشخصي)، ونوع الرسالة (نص/صوت/صورة/موقع).
                  </p>
                </div>

                <div className="bg-orange-50 border-r-4 border-orange-400 rounded-lg p-4">
                  <p className="font-semibold text-orange-900 mb-1">د. بيانات منصات التواصل</p>
                  <p className="text-orange-800 text-sm">
                    معرّف حساب واتساب للأعمال (WABA ID)، رقم الهاتف المرتبط، رمز الوصول (Access Token) المشفر،
                    معرّف حساب إنستقرام للأعمال، ومعرّف بوت تيليقرام.
                  </p>
                </div>

                <div className="bg-red-50 border-r-4 border-red-400 rounded-lg p-4">
                  <p className="font-semibold text-red-900 mb-1">هـ. بيانات الدفع والاشتراك</p>
                  <p className="text-red-800 text-sm">
                    سجل المدفوعات (المبلغ، التاريخ، حالة الدفع)، نوع الاشتراك، وتاريخ الانتهاء.
                    <strong> لا نخزن بيانات البطاقة الائتمانية</strong> — يتم معالجتها مباشرة عبر بوابة <strong>مُيسّر (Moyasar)</strong> المرخصة من البنك المركزي السعودي (ساما).
                  </p>
                </div>

                <div className="bg-gray-50 border-r-4 border-gray-400 rounded-lg p-4">
                  <p className="font-semibold text-gray-900 mb-1">و. بيانات الاستخدام التقنية</p>
                  <p className="text-gray-700 text-sm">
                    عدد الرسائل المرسلة والمستلمة، إحصائيات الاستخدام الشهرية، عنوان IP (لأغراض أمنية فقط)،
                    ونوع المتصفح والجهاز.
                  </p>
                </div>
              </div>
            </section>

            {/* 4. Legal Basis */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">4. الأساس القانوني لمعالجة البيانات</h2>
              <p>نعالج بياناتك الشخصية بناءً على الأسس القانونية التالية وفقاً لنظام PDPL:</p>
              <div className="mt-3 space-y-2 text-sm">
                <p>• <strong>تنفيذ العقد:</strong> معالجة البيانات الضرورية لتقديم الخدمة المتفق عليها (المادة 6).</p>
                <p>• <strong>الموافقة:</strong> موافقتك الصريحة عند التسجيل واستخدام الخدمة (المادة 5).</p>
                <p>• <strong>المصلحة المشروعة:</strong> تحسين الخدمة وحماية أمن المنصة (المادة 6).</p>
                <p>• <strong>الالتزام القانوني:</strong> الامتثال للأنظمة واللوائح السعودية.</p>
              </div>
            </section>

            {/* 5. How We Use Data */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">5. كيف نستخدم بياناتك</h2>
              <p>نستخدم البيانات المجمعة للأغراض التالية حصراً:</p>
              <div className="mt-3 space-y-2 text-sm">
                <p>• تقديم خدمة الرد الآلي الذكي على عملاء متجرك عبر واتساب وإنستقرام.</p>
                <p>• تحسين أداء الذكاء الاصطناعي من خلال تعلّم الإجابات التي تقدمها (قاعدة المعرفة الخاصة بمتجرك فقط).</p>
                <p>• إرسال إشعارات التصعيد عبر تيليقرام عندما يحتاج سؤال عميل لتدخلك.</p>
                <p>• معالجة المدفوعات وإدارة الاشتراكات.</p>
                <p>• إرسال إشعارات تتعلق بحسابك أو تحديثات الخدمة.</p>
                <p>• تحليل الاستخدام لتحسين وتطوير الخدمة (بيانات مجمّعة غير شخصية).</p>
                <p>• حماية أمن المنصة ومنع الاحتيال.</p>
              </div>
              <p className="mt-3 text-sm font-semibold text-emerald-700">
                نحن لا نستخدم بياناتك لأغراض إعلانية أو تسويقية لأطراف ثالثة.
              </p>
            </section>

            {/* 6. Data Sharing */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">6. مشاركة البيانات مع أطراف ثالثة</h2>
              <p className="mb-3 font-semibold">لا نبيع أو نؤجر بياناتك الشخصية لأي طرف ثالث. نشارك البيانات فقط مع:</p>

              <div className="overflow-hidden rounded-xl border border-gray-200">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-right p-3 font-semibold text-gray-700 border-b">الطرف</th>
                      <th className="text-right p-3 font-semibold text-gray-700 border-b">الغرض</th>
                      <th className="text-right p-3 font-semibold text-gray-700 border-b">البيانات المشاركة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr>
                      <td className="p-3 font-medium">OpenAI</td>
                      <td className="p-3">معالجة الذكاء الاصطناعي (GPT)</td>
                      <td className="p-3">محتوى المحادثات (بدون أرقام هواتف)</td>
                    </tr>
                    <tr className="bg-gray-50/50">
                      <td className="p-3 font-medium">Meta (واتساب)</td>
                      <td className="p-3">إرسال واستقبال الرسائل</td>
                      <td className="p-3">الرسائل عبر WhatsApp Cloud API</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium">Meta (إنستقرام)</td>
                      <td className="p-3">إرسال واستقبال الرسائل</td>
                      <td className="p-3">الرسائل عبر Instagram Graph API</td>
                    </tr>
                    <tr className="bg-gray-50/50">
                      <td className="p-3 font-medium">Telegram</td>
                      <td className="p-3">إشعارات التصعيد لأصحاب المتاجر</td>
                      <td className="p-3">ملخص السؤال ومعرّف المحادثة</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium">مُيسّر (Moyasar)</td>
                      <td className="p-3">معالجة المدفوعات</td>
                      <td className="p-3">معرّف المتجر ومبلغ الدفع فقط</td>
                    </tr>
                    <tr className="bg-gray-50/50">
                      <td className="p-3 font-medium">Supabase</td>
                      <td className="p-3">استضافة قاعدة البيانات</td>
                      <td className="p-3">جميع البيانات (مشفرة ومحمية بـ RLS)</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium">Cloudflare</td>
                      <td className="p-3">استضافة الواجهة الأمامية وحماية DDoS</td>
                      <td className="p-3">بيانات التصفح الأساسية</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* 7. Data Security */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">7. حماية وأمن البيانات</h2>
              <p>نطبق إجراءات أمنية متقدمة لحماية بياناتك تشمل:</p>
              <div className="mt-3 space-y-2 text-sm">
                <p>• <strong>التشفير:</strong> جميع البيانات مشفرة أثناء النقل (TLS 1.3) وأثناء التخزين (AES-256).</p>
                <p>• <strong>عزل البيانات (RLS):</strong> كل متجر معزول بالكامل — لا يمكن لأي مستخدم الوصول لبيانات متجر آخر.</p>
                <p>• <strong>رموز الوصول:</strong> يتم تخزين رموز الوصول (Access Tokens) على الخادم فقط، ولا تُرسل أبداً للمتصفح.</p>
                <p>• <strong>التحقق من الدفع:</strong> يتم التحقق من كل عملية دفع على مستوى الخادم (Server-side) مع حماية ضد هجمات الإعادة.</p>
                <p>• <strong>رؤوس الأمان:</strong> نستخدم CSP, X-Frame-Options, HSTS وغيرها لحماية من هجمات XSS و Clickjacking.</p>
                <p>• <strong>النسخ الاحتياطي:</strong> نسخ احتياطية تلقائية يومية مع إمكانية استعادة البيانات.</p>
              </div>
            </section>

            {/* 8. Data Retention */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">8. مدة الاحتفاظ بالبيانات</h2>
              <div className="overflow-hidden rounded-xl border border-gray-200">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-right p-3 font-semibold text-gray-700 border-b">نوع البيانات</th>
                      <th className="text-right p-3 font-semibold text-gray-700 border-b">مدة الاحتفاظ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr><td className="p-3">بيانات الحساب</td><td className="p-3">طوال فترة الاشتراك النشط + 30 يوماً بعد الإلغاء</td></tr>
                    <tr className="bg-gray-50/50"><td className="p-3">المحادثات والرسائل</td><td className="p-3">12 شهراً من تاريخ الرسالة</td></tr>
                    <tr><td className="p-3">بيانات المنتجات وقاعدة المعرفة</td><td className="p-3">طوال فترة الاشتراك + 30 يوماً</td></tr>
                    <tr className="bg-gray-50/50"><td className="p-3">سجلات الدفع</td><td className="p-3">7 سنوات (متطلب نظامي — نظام الزكاة والضريبة)</td></tr>
                    <tr><td className="p-3">سجلات الأمان (IP, logs)</td><td className="p-3">90 يوماً</td></tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* 9. Your Rights */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">9. حقوقك (وفقاً لنظام PDPL)</h2>
              <p className="mb-3">لديك الحقوق التالية فيما يخص بياناتك الشخصية:</p>
              <div className="space-y-3">
                <div className="flex gap-3 items-start">
                  <span className="bg-emerald-100 text-emerald-700 rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold shrink-0">1</span>
                  <div><strong>حق الوصول:</strong> الاطلاع على بياناتك الشخصية المخزنة لدينا والحصول على نسخة منها.</div>
                </div>
                <div className="flex gap-3 items-start">
                  <span className="bg-emerald-100 text-emerald-700 rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold shrink-0">2</span>
                  <div><strong>حق التصحيح:</strong> تعديل أو تحديث بياناتك غير الدقيقة من لوحة التحكم أو بالتواصل معنا.</div>
                </div>
                <div className="flex gap-3 items-start">
                  <span className="bg-emerald-100 text-emerald-700 rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold shrink-0">3</span>
                  <div><strong>حق الحذف:</strong> طلب حذف جميع بياناتك الشخصية. انظر <a href="/data-deletion" className="text-emerald-600 hover:underline">صفحة طلب الحذف</a>.</div>
                </div>
                <div className="flex gap-3 items-start">
                  <span className="bg-emerald-100 text-emerald-700 rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold shrink-0">4</span>
                  <div><strong>حق سحب الموافقة:</strong> سحب موافقتك على معالجة بياناتك في أي وقت.</div>
                </div>
                <div className="flex gap-3 items-start">
                  <span className="bg-emerald-100 text-emerald-700 rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold shrink-0">5</span>
                  <div><strong>حق نقل البيانات:</strong> الحصول على بياناتك بتنسيق قابل للقراءة آلياً.</div>
                </div>
                <div className="flex gap-3 items-start">
                  <span className="bg-emerald-100 text-emerald-700 rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold shrink-0">6</span>
                  <div><strong>حق الاعتراض:</strong> الاعتراض على معالجة بياناتك لأغراض معينة.</div>
                </div>
                <div className="flex gap-3 items-start">
                  <span className="bg-emerald-100 text-emerald-700 rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold shrink-0">7</span>
                  <div><strong>حق تقديم شكوى:</strong> تقديم شكوى لدى الهيئة السعودية للبيانات والذكاء الاصطناعي (سدايا).</div>
                </div>
              </div>
              <p className="mt-4 text-sm">
                لممارسة أي من هذه الحقوق، تواصل معنا على: <a href="mailto:privacy@radadai.com" className="text-emerald-600 hover:underline">privacy@radadai.com</a>
              </p>
            </section>

            {/* 10. International Data Transfer */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">10. نقل البيانات خارج المملكة</h2>
              <p>
                قد يتم نقل بعض البيانات خارج المملكة العربية السعودية لمعالجتها بواسطة مزودي الخدمة المذكورين أعلاه
                (OpenAI في الولايات المتحدة، Supabase في سنغافورة). يتم ذلك وفقاً للضوابط المنصوص عليها في
                نظام PDPL مع ضمان مستوى حماية مناسب للبيانات المنقولة.
              </p>
            </section>

            {/* 11. Cookies */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">11. ملفات تعريف الارتباط (Cookies)</h2>
              <p>
                نستخدم ملفات تعريف الارتباط الضرورية فقط لتشغيل الخدمة (مثل رمز جلسة تسجيل الدخول).
                لا نستخدم ملفات تعريف ارتباط إعلانية أو تتبعية من أطراف ثالثة.
              </p>
            </section>

            {/* 12. Children */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">12. حماية الأطفال</h2>
              <p>
                خدماتنا موجهة لأصحاب الأعمال والأشخاص الذين تبلغ أعمارهم 18 سنة فما فوق.
                لا نجمع عمداً بيانات شخصية من الأطفال (أقل من 18 سنة). إذا اكتشفنا أن طفلاً
                قد قدم لنا بيانات شخصية، سنقوم بحذفها فوراً.
              </p>
            </section>

            {/* 13. Changes */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">13. التعديلات على السياسة</h2>
              <p>
                قد نقوم بتحديث هذه السياسة من وقت لآخر. سنُعلمك بأي تغييرات جوهرية عبر البريد الإلكتروني
                أو إشعار في لوحة التحكم. استمرارك في استخدام الخدمة بعد التعديل يعني موافقتك على السياسة المحدثة.
              </p>
            </section>

            {/* 14. Contact */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">14. التواصل معنا</h2>
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
                <p className="font-semibold text-emerald-900 mb-3">لأي استفسارات حول سياسة الخصوصية أو بياناتك:</p>
                <p className="text-emerald-800">البريد الإلكتروني: <a href="mailto:privacy@radadai.com" className="hover:underline font-medium">privacy@radadai.com</a></p>
                <p className="text-emerald-800 mt-1">البريد البديل: <a href="mailto:salahs@smarttec.sa" className="hover:underline font-medium">salahs@smarttec.sa</a></p>
                <p className="text-emerald-800 mt-1">الموقع: <a href="https://stores.radadai.com" className="hover:underline font-medium">stores.radadai.com</a></p>
              </div>
            </section>
          </div>

          <div className="mt-10 pt-6 border-t border-gray-200 text-center text-sm text-gray-400">
            © 2026 رداد للذكاء الاصطناعي — مؤسسة سمارتك لتقنية المعلومات — جميع الحقوق محفوظة
          </div>
        </div>
      </div>
    </div>
  )
}
