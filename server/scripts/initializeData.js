const { connectDB, News, Conversations, Articles, Palestine, Gallery, FamilyTree } = require('../models');
require('dotenv').config();

const initializeData = async () => {
  try {
    await connectDB();
    console.log('✓ متصل بقاعدة البيانات');

    // Check if data already exists
    const newsCount = await News.countDocuments();
    if (newsCount > 0) {
      console.log('✓ البيانات موجودة بالفعل');
      process.exit(0);
    }

    console.log('⏳ جاري إضافة البيانات التجريبية...');

    // Sample News Data
    const newsData = [
      {
        title: "احتفال عائلة الشاعر بالعيد",
        content: "احتفلت عائلة الشاعر بعيد الفطر المبارك في جو من الفرح والسرور، حيث اجتمع جميع أفراد العائلة في بيت الجد الكبير.",
        author: "أحمد الشاعر",
        date: new Date('2024-04-10')
      },
      {
        title: "زواج محمد الشاعر",
        content: "تم الاحتفال بزواج محمد الشاعر من كريمة عائلة النجار في حفل بهيج حضره جميع أفراد العائلة والأصدقاء.",
        author: "فاطمة الشاعر",
        date: new Date('2024-03-15')
      },
      {
        title: "تخرج سارة من الجامعة",
        content: "تخرجت سارة محمد الشاعر من كلية الطب بتقدير امتياز، وقد احتفلت العائلة بهذا الإنجاز المميز.",
        author: "محمد الشاعر",
        date: new Date('2024-06-20')
      }
    ];

    await News.insertMany(newsData);
    console.log('✓ تم إضافة الأخبار');

    // Sample Conversations Data
    const conversationsData = [
      {
        title: "حوار مع الجد حول تاريخ العائلة",
        participants: ["الجد عبد الله الشاعر", "أحمد الشاعر"],
        content: "في هذا الحوار الشيق، يحكي لنا الجد عبد الله عن تاريخ عائلة الشاعر وأصولها العريقة في فلسطين. يروي الجد ذكرياته عن الحياة في القرية القديمة، والتقاليد العائلية التي توارثناها عبر الأجيال.",
        date: new Date('2024-02-20')
      },
      {
        title: "نقاش حول المستقبل مع الجيل الجديد",
        participants: ["علي أحمد الشاعر", "سارة محمد الشاعر", "يوسف أحمد الشاعر"],
        content: "حوار مثمر بين أفراد الجيل الجديد حول خططهم المستقبلية وكيفية المحافظة على تقاليد العائلة مع مواكبة التطور الحديث.",
        date: new Date('2024-01-10')
      }
    ];

    await Conversations.insertMany(conversationsData);
    console.log('✓ تم إضافة الحوارات');

    // Sample Articles Data
    const articlesData = [
      {
        title: "أهمية الحفاظ على التراث العائلي",
        author: "د. أحمد الشاعر",
        content: "في عصر العولمة، يصبح الحفاظ على التراث العائلي أمراً بالغ الأهمية لنقل القيم والتقاليد للأجيال القادمة. إن تراثنا العائلي ليس مجرد ذكريات من الماضي، بل هو الأساس الذي نبني عليه هويتنا ومستقبلنا. من خلال الحفاظ على قصصنا وتقاليدنا، نضمن استمرارية الروابط القوية بين أفراد العائلة عبر الأجيال المختلفة.",
        date: new Date('2024-01-15')
      },
      {
        title: "ذكريات من فلسطين الحبيبة",
        author: "عبد الله الشاعر",
        content: "أتذكر تلك الأيام الجميلة في قريتنا الصغيرة في فلسطين، حيث كانت رائحة الياسمين تملأ الأجواء، وأشجار الزيتون تحكي قصص الأجداد. كانت الحياة بسيطة لكنها مليئة بالدفء والمحبة. كل زاوية في تلك القرية تحمل ذكرى عزيزة على قلبي.",
        date: new Date('2024-05-01')
      }
    ];

    await Articles.insertMany(articlesData);
    console.log('✓ تم إضافة المقالات');

    // Sample Palestine Data
    const palestineData = [
      {
        title: "جذورنا في فلسطين",
        content: "تنتمي عائلة الشاعر إلى قرية عين كارم في القدس، حيث عاشت لأجيال عديدة قبل النكبة عام 1948. هذه القرية الجميلة كانت موطن أجدادنا، حيث زرعوا الأرض وبنوا بيوتاً من الحجر الأبيض تشهد على تاريخ عريق.",
        image: "palestine1.jpg"
      },
      {
        title: "ذكريات الوطن",
        content: "يحتفظ كبار العائلة بذكريات جميلة عن الحياة في فلسطين، من أشجار الزيتون إلى رائحة الياسمين. هذه الذكريات تنتقل من جيل إلى آخر، محافظة على الهوية الفلسطينية في قلوب أفراد العائلة.",
        image: "palestine2.jpg"
      },
      {
        title: "التراث الفلسطيني في عائلتنا",
        content: "نحافظ في عائلة الشاعر على التراث الفلسطيني الأصيل من خلال الطعام التقليدي، الأغاني الشعبية، والحرف اليدوية. هذا التراث يربطنا بجذورنا ويقوي هويتنا الفلسطينية.",
        image: "palestinian-heritage.jpg"
      }
    ];

    await Palestine.insertMany(palestineData);
    console.log('✓ تم إضافة محتوى فلسطين');

    // Sample Gallery Data
    const galleryData = [
      {
        title: "صور العائلة التاريخية",
        description: "مجموعة من الصور التاريخية لعائلة الشاعر عبر العقود، تحكي قصة الأجيال المختلفة",
        images: ["family1.jpg", "family2.jpg", "family3.jpg"]
      },
      {
        title: "احتفالات العائلة",
        description: "صور من احتفالات العائلة المختلفة، الأعراس، التخرج، والمناسبات السعيدة",
        images: ["celebration1.jpg", "celebration2.jpg", "wedding1.jpg"]
      },
      {
        title: "ذكريات من فلسطين",
        description: "صور نادرة من فلسطين والأماكن التي عاشت فيها العائلة",
        images: ["palestine-old1.jpg", "palestine-old2.jpg", "village.jpg"]
      }
    ];

    await Gallery.insertMany(galleryData);
    console.log('✓ تم إضافة معرض الصور');

    // Sample Family Tree Data
    const familyTreeData = {
      patriarch: "عبد الله الشاعر",
      generations: [
        {
          generation: 1,
          members: ["عبد الله الشاعر", "فاطمة الشاعر (الزوجة)"]
        },
        {
          generation: 2,
          members: ["أحمد الشاعر", "محمد الشاعر", "عائشة الشاعر", "خديجة الشاعر"]
        },
        {
          generation: 3,
          members: ["علي أحمد الشاعر", "سارة محمد الشاعر", "يوسف أحمد الشاعر", "مريم أحمد الشاعر"]
        }
      ]
    };

    const familyTree = new FamilyTree(familyTreeData);
    await familyTree.save();
    console.log('✓ تم إضافة شجرة العائلة');

    console.log('🎉 تم إضافة جميع البيانات التجريبية بنجاح!');
    console.log('📊 الإحصائيات:');
    console.log(`   - الأخبار: ${await News.countDocuments()}`);
    console.log(`   - الحوارات: ${await Conversations.countDocuments()}`);
    console.log(`   - المقالات: ${await Articles.countDocuments()}`);
    console.log(`   - محتوى فلسطين: ${await Palestine.countDocuments()}`);
    console.log(`   - معرض الصور: ${await Gallery.countDocuments()}`);
    console.log(`   - شجرة العائلة: ${await FamilyTree.countDocuments()}`);

  } catch (error) {
    console.error('❌ خطأ في إضافة البيانات:', error);
  } finally {
    process.exit(0);
  }
};

// Run if called directly
if (require.main === module) {
  initializeData();
}

module.exports = initializeData;
