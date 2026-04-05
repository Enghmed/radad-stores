import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function Terms() {
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">الشروط والأحكام</h1>
            <p className="text-lg text-gray-500">Terms and Conditions</p>
            <p className="text-sm text-gray-400 mt-2">آخر تحديث: أبريل 2026 | Last updated: April 2026</p>
          </div>

          <div className="space-y-8 text-gray-700 leading-relaxed">
            {/* 1. Introduction */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">1. مقدمة وقبول الشروط</h2>
              <p>
                باستخدامك لمنصة <strong>رداد للذكاء الاصطناعي</strong> ("رداد"، "الخدمة"، "المنصة")، المملوكة لـ<strong>مؤسسة سمارتك لتقنية المعلومات</strong>
                (سجل تجاري رقم: __________)، فإنك توافق على الالتزام بهذه الشروط والأحكام.
              </p>
              <p className="mt-3">
                إذا لم تكن موافقاً على أي من هذه الشروط، يرجى عدم استخدام الخدمة.
                هذه الشروط تشكّل اتفاقية قانونية ملزمة بينك وبين رداد.
              </p>
              <p className="mt-3 text-sm text-gray-500">
                By using Radad AI, you agree to be bound by these Terms and Conditions.
                These terms constitute a legally binding agreement between you and Radad AI.
              </p>
            </section>

            {/* 2. Service Description */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">2. وصف الخدمة</h2>
              <p>رداد هي منصة ذكاء اصطناعي (SaaS) تقدم الخدمات التالية لأصحاب المتاجر السعودية:</p>
              <div className="mt-3 space-y-2 text-sm">
                <p>• <strong>الرد التلقائي الذكي:</strong> الرد على استفسارات العملاء عبر واتساب وإنستقرام باستخدام الذكاء الاصطناعي.</p>
                <p>• <strong>التصعيد الذكي:</strong> تحويل الأسئلة التي لا يعرف الذكاء الاصطناعي إجابتها لصاحب المتجر عبر تيليقرام.</p>
                <p>• <strong>التعلم المستمر:</strong> يتعلم الذكاء الاصطناعي من إجابات صاحب المتجر ليرد تلقائياً في المرات القادمة.</p>
                <p>• <strong>إدارة المنتجات:</strong> إضافة المنتجات يدوياً أو استيرادها من قوقل ماب.</p>
                <p>• <strong>قاعدة المعرفة:</strong> بناء قاعدة أسئلة وأجوبة خاصة بالمتجر.</p>
                <p>• <strong>لوحة تحكم:</strong> متابعة المحادثات والإحصائيات وإدارة الإعدادات.</p>
              </div>
            </section>

            {/* 3. Registration */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">3. التسجيل والحساب</h2>
              <p>لاستخدام الخدمة يجب عليك:</p>
              <div className="mt-3 space-y-2 text-sm">
                <p>• أن يكون عمرك <strong>18 سنة أو أكثر</strong>.</p>
                <p>• أن تكون <strong>صاحب متجر أو مخوّل</strong> من صاحب المتجر لاستخدام الخدمة.</p>
                <p>• تقديم <strong>معلومات صحيحة ودقيقة</strong> عند التسجيل.</p>
                <p>• الحفاظ على <strong>سرية بيانات حسابك</strong> وكلمة المرور.</p>
                <p>• إبلاغنا فوراً عن أي <strong>استخدام غير مصرح به</strong> لحسابك.</p>
              </div>
              <p className="mt-3 text-sm">
                أنت مسؤول عن جميع الأنشطة التي تتم من خلال حسابك.
              </p>
            </section>

            {/* 4. Subscriptions */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">4. الاشتراكات والدفع</h2>

              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 mb-4">
                <h3 className="font-semibold text-emerald-900 mb-3">الخطط المتاحة:</h3>
                <div className="space-y-2 text-sm text-emerald-800">
                  <p>• <strong>فترة تجريبية مجانية:</strong> 10 أيام — 100 رسالة ذكية — لا يلزم بطاقة دفع.</p>
                  <p>• <strong>الاشتراك الشهري:</strong> 100 ريال سعودي/شهر — 10,000 رد ذكي شهرياً.</p>
                  <p>• <strong>الاشتراك السنوي:</strong> 1,000 ريال سعودي/سنة — 10,000 رد ذكي شهرياً (وفّر 200 ريال).</p>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <p>• يتم تجديد الاشتراك تلقائياً ما لم يتم إلغاؤه قبل تاريخ التجديد.</p>
                <p>• يمكنك إلغاء الاشتراك في أي وقت من لوحة التحكم — تستمر الخدمة حتى نهاية الفترة المدفوعة.</p>
                <p>• المدفوعات تتم عبر بوابة <strong>مُيسّر (Moyasar)</strong> المرخصة من البنك المركزي السعودي.</p>
                <p>• طرق الدفع المقبولة: مدى، فيزا، ماستركارد، Apple Pay، STC Pay.</p>
                <p>• جميع الأسعار <strong>شاملة ضريبة القيمة المضافة (15%)</strong>.</p>
              </div>
            </section>

            {/* 5. Refund Policy */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">5. سياسة الاسترداد</h2>
              <div className="space-y-2 text-sm">
                <p>• يمكنك طلب استرداد كامل خلال <strong>7 أيام</strong> من تاريخ أول اشتراك مدفوع إذا لم تكن راضياً عن الخدمة.</p>
                <p>• بعد مرور 7 أيام، لا يتم استرداد المبالغ المدفوعة عن الفترة الحالية.</p>
                <p>• عند إلغاء الاشتراك، تستمر الخدمة حتى نهاية الفترة المدفوعة.</p>
                <p>• لطلب الاسترداد، تواصل معنا على <a href="mailto:salahs@smarttec.sa" className="text-emerald-600 hover:underline">salahs@smarttec.sa</a></p>
              </div>
            </section>

            {/* 6. Acceptable Use */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">6. الاستخدام المقبول</h2>
              <p className="mb-3">يجب عليك استخدام الخدمة بشكل قانوني وأخلاقي. <strong>يُمنع</strong> استخدام الخدمة في:</p>
              <div className="space-y-2 text-sm">
                <p className="text-red-700">• إرسال رسائل مزعجة (Spam) أو غير مرغوب فيها للعملاء.</p>
                <p className="text-red-700">• نشر محتوى مخالف للأنظمة السعودية أو الشريعة الإسلامية.</p>
                <p className="text-red-700">• انتحال شخصية أو تضليل العملاء بمعلومات كاذبة.</p>
                <p className="text-red-700">• استخدام الخدمة لأغراض غير قانونية أو احتيالية.</p>
                <p className="text-red-700">• محاولة اختراق أو تعطيل المنصة أو الوصول إلى بيانات متاجر أخرى.</p>
                <p className="text-red-700">• محاولة التلاعب بالذكاء الاصطناعي لاستخراج بيانات النظام أو بيانات مستخدمين آخرين (Prompt Injection).</p>
                <p className="text-red-700">• بيع أو إعادة بيع الخدمة لأطراف ثالثة بدون إذن مسبق.</p>
                <p className="text-red-700">• تجاوز حدود الاستخدام أو محاولة التحايل على نظام الاشتراك.</p>
              </div>
              <p className="mt-3 text-sm">
                نحتفظ بالحق في تعليق أو إنهاء حسابك فوراً في حالة مخالفة أي من هذه الشروط.
              </p>
            </section>

            {/* 7. AI Disclaimer */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">7. الذكاء الاصطناعي — إخلاء المسؤولية</h2>
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5">
                <div className="space-y-3 text-sm text-yellow-900">
                  <p>
                    <strong>طبيعة الخدمة:</strong> الذكاء الاصطناعي يقدم ردوداً بناءً على المعلومات المتوفرة في متجرك
                    (المنتجات، قاعدة المعرفة، الإعدادات). الردود يتم توليدها آلياً وقد لا تكون دقيقة بنسبة 100%.
                  </p>
                  <p>
                    <strong>مسؤوليتك:</strong> أنت كصاحب المتجر تتحمل المسؤولية النهائية عن المعلومات المقدمة لعملائك.
                    ننصح بمراجعة المحادثات بانتظام وتحديث قاعدة المعرفة لضمان دقة الردود.
                  </p>
                  <p>
                    <strong>التصعيد:</strong> عندما لا يعرف الذكاء الاصطناعي الإجابة، يقوم بتصعيد السؤال لك بصمت دون
                    إعلام العميل. هذا يضمن عدم تقديم معلومات خاطئة.
                  </p>
                  <p>
                    <strong>عدم الضمان:</strong> لا نضمن توفر الخدمة بنسبة 100% أو خلوها من الأخطاء.
                    نسعى لتقديم أفضل خدمة ممكنة ولكن قد تحدث انقطاعات فنية.
                  </p>
                </div>
              </div>
            </section>

            {/* 8. Intellectual Property */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">8. الملكية الفكرية</h2>
              <div className="space-y-2 text-sm">
                <p>• <strong>ملكيتنا:</strong> جميع حقوق الملكية الفكرية للمنصة وتقنياتها وتصميمها وشعارها تعود لرداد / مؤسسة سمارتك لتقنية المعلومات.</p>
                <p>• <strong>ملكيتك:</strong> تحتفظ أنت بالملكية الكاملة لجميع بيانات متجرك ومنتجاتك ومحتوى قاعدة المعرفة.</p>
                <p>• <strong>الترخيص:</strong> بتحميل المحتوى على المنصة، تمنحنا ترخيصاً محدوداً وغير حصري لاستخدامه في تقديم الخدمة لك فقط. ينتهي هذا الترخيص عند حذف حسابك.</p>
                <p>• لا يحق لك نسخ أو إعادة توزيع أو عكس هندسة أي جزء من المنصة.</p>
              </div>
            </section>

            {/* 9. Limitation of Liability */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">9. تحديد المسؤولية</h2>
              <div className="space-y-2 text-sm">
                <p>• الخدمة مقدمة <strong>"كما هي" (As Is)</strong> بدون ضمانات صريحة أو ضمنية.</p>
                <p>• لا نتحمل المسؤولية عن أي خسائر مباشرة أو غير مباشرة ناتجة عن استخدام الخدمة، بما في ذلك: الأرباح الفائتة، فقدان البيانات، توقف الأعمال، أو الأضرار التبعية.</p>
                <p>• <strong>الحد الأقصى لمسؤوليتنا:</strong> يقتصر على المبلغ المدفوع لنا من قبلك خلال آخر 12 شهراً.</p>
                <p>• لا نتحمل المسؤولية عن انقطاع الخدمة بسبب: صيانة مجدولة، أعطال في خدمات الطرف الثالث (واتساب، OpenAI، إلخ)، أو قوة قاهرة.</p>
              </div>
            </section>

            {/* 10. WhatsApp / Meta Terms */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">10. شروط واتساب و Meta</h2>
              <p className="text-sm">
                باستخدامك لميزة واتساب في رداد، فإنك توافق أيضاً على الالتزام بـ:
              </p>
              <div className="mt-3 space-y-2 text-sm">
                <p>• <a href="https://www.whatsapp.com/legal/business-policy" target="_blank" rel="noopener" className="text-emerald-600 hover:underline">سياسة واتساب للأعمال (WhatsApp Business Policy)</a></p>
                <p>• <a href="https://www.whatsapp.com/legal/commerce-policy" target="_blank" rel="noopener" className="text-emerald-600 hover:underline">سياسة التجارة لواتساب (Commerce Policy)</a></p>
                <p>• <a href="https://developers.facebook.com/terms/" target="_blank" rel="noopener" className="text-emerald-600 hover:underline">شروط منصة Meta للمطورين</a></p>
              </div>
              <p className="mt-3 text-sm">
                رداد يستخدم واجهة WhatsApp Cloud API الرسمية من Meta. أنت مسؤول عن التأكد من أن استخدامك
                يتوافق مع سياسات Meta وواتساب.
              </p>
            </section>

            {/* 11. Termination */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">11. إنهاء الخدمة</h2>
              <div className="space-y-2 text-sm">
                <p>• <strong>من جانبك:</strong> يمكنك إلغاء حسابك في أي وقت من الإعدادات أو بالتواصل معنا. تستمر الخدمة حتى نهاية الفترة المدفوعة.</p>
                <p>• <strong>من جانبنا:</strong> نحتفظ بالحق في تعليق أو إنهاء حسابك في حالة: مخالفة هذه الشروط، استخدام احتيالي، عدم الدفع بعد 30 يوماً من تاريخ الاستحقاق.</p>
                <p>• <strong>عند الإنهاء:</strong> سيتم حذف بياناتك وفقاً لـ<a href="/privacy" className="text-emerald-600 hover:underline">سياسة الخصوصية</a> (خلال 30 يوماً).</p>
                <p>• <strong>تصدير البيانات:</strong> يمكنك طلب تصدير بياناتك قبل إنهاء الحساب.</p>
              </div>
            </section>

            {/* 12. Governing Law */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">12. القانون المعمول به وحل النزاعات</h2>
              <p className="text-sm">
                تخضع هذه الشروط لأنظمة ولوائح <strong>المملكة العربية السعودية</strong>. في حالة أي نزاع:
              </p>
              <div className="mt-3 space-y-2 text-sm">
                <p>• يتم محاولة حله ودياً خلال 30 يوماً من تقديم الشكوى.</p>
                <p>• في حالة عدم الوصول لحل ودي، يتم اللجوء للجهات القضائية المختصة في المملكة العربية السعودية.</p>
              </div>
            </section>

            {/* 13. Changes */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">13. التعديلات على الشروط</h2>
              <p className="text-sm">
                نحتفظ بالحق في تعديل هذه الشروط في أي وقت. سنُعلمك بأي تغييرات جوهرية قبل 30 يوماً على الأقل
                عبر البريد الإلكتروني أو إشعار في لوحة التحكم. استمرارك في استخدام الخدمة بعد سريان التعديلات
                يعني موافقتك عليها.
              </p>
            </section>

            {/* 14. Severability */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">14. قابلية الفصل</h2>
              <p className="text-sm">
                إذا تبيّن أن أي بند من هذه الشروط غير صالح أو غير قابل للتنفيذ، فإن ذلك لا يؤثر على صلاحية
                وقابلية تنفيذ البنود الأخرى.
              </p>
            </section>

            {/* 15. Contact */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">15. التواصل</h2>
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
                <p className="font-semibold text-emerald-900 mb-3">لأي استفسارات حول الشروط والأحكام:</p>
                <p className="text-emerald-800">البريد الإلكتروني: <a href="mailto:salahs@smarttec.sa" className="hover:underline font-medium">salahs@smarttec.sa</a></p>
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
