// headerアニメーション
function runMainScripts() {
  console.log("自作アニメーション開始");
  const navBody = document.querySelector(".header__body--nav");
  const closeBtn = document.querySelector(".close-btn");
  console.log(closeBtn);
  let lastScrollTop = 0;

  // 背景アクション
  window.addEventListener("scroll", function () {
    const scrollY = window.scrollY;
    document.body.style.backgroundPosition = `center ${scrollY / -20}px`;
  });

  // ナビゲーションバー
  // window.addEventListener("scroll", () => {
  //   const currentScroll = window.pageYOffset || document.documentElement.scrollTop;

  //   if (currentScroll > lastScrollTop && currentScroll > 50) {
  //     navBody.classList.add("fade-out");
  //     closeBtn.classList.add("visible");
  //   } else {
  //     navBody.classList.remove("fade-out");
  //     closeBtn.classList.remove("visible");
  //   }

  //   lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
  // });

  function updateNavState() {
    const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
    const isSmallScreen = window.innerWidth < 1024; // PC未満を判定
  
    if (isSmallScreen || (currentScroll > lastScrollTop && currentScroll > 50)) {
      navBody.classList.add("fade-out");
      closeBtn.classList.add("visible");
    } else {
      navBody.classList.remove("fade-out");
      closeBtn.classList.remove("visible");
    }
  
    lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
  }
  
  window.addEventListener("scroll", updateNavState);
  window.addEventListener("resize", updateNavState);
  updateNavState(); 

  closeBtn.addEventListener("click", () => {
    navBody.classList.remove("fade-out");
    closeBtn.classList.remove("visible");
  });

  function applyLettering(selector) {
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => {
      const text = el.textContent;
      el.innerHTML = '';
      text.split('').forEach(char => {
        const span = document.createElement('span');
        span.textContent = char;
        el.appendChild(span);
      });
    });
  }

  applyLettering(".title");
  applyLettering(".button");

  document.querySelectorAll('.button').forEach(btn => {
    btn.addEventListener('click', animation);
  });

  // const serviceSection = document.querySelector('.service');
  // const observer = new IntersectionObserver((entries, observer) => {
  //   entries.forEach(entry => {
  //     if (entry.isIntersecting) {
  //       console.log("SERVICEセクションが表示されました");
  //       animation();
  //       observer.unobserve(entry.target);
  //     }
  //   });
  // }, {
  //   threshold: 0.5
  // });
  // observer.observe(serviceSection);

  function animation () {
    const timeline = gsap.timeline();

    timeline.set(".button", { visibility: 'hidden', opacity: 0 });

    const titleSpans = document.querySelectorAll(".title span");
    timeline.fromTo(titleSpans,
      {
        opacity: 0,
        bottom: "-80px"
      }, {
        opacity: 1,
        bottom: "0px",
        ease: "back.out(1.7)",
        stagger: 0.05
      }
    );

    timeline.fromTo('.is-slide-up', 
      { opacity: 0, y: 60 }, 
      { opacity: 1, y: 0, duration: 1, ease: 'power2.out' }, 
      '<' // 同時に開始
    );

    timeline.to(".button", { visibility: 'visible', opacity: 1, duration: 0.2 });
  }
}

window.addEventListener('load', () => {
  setTimeout(() => {
    runMainScripts();
  }, 5000);  // 5000ミリ秒 = 5秒後に実行
});

// DIFYセクション
function sendToDify(selections) {
  console.log("送信開始");
  fetch('https://selectlanchserver.onrender.com/send-to-dify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      inputs: {
        country: selections.selectedCountry,
        main: selections.selectedMain,
        dish: selections.selectedMainDish
      },
      user: "user"
    })
  })
  .then(response => {
    if (!response.ok) throw new Error("Dify送信に失敗しました。");
    return response.json();
  }).then(res => {
    console.log(res);
  
    // 安全に result を取得
    const aiReply = res.data?.outputs?.result ?? "AIからの返答がありません";
    console.log("Difyの返答", aiReply);
  
    const t = `/result.html?ai=${encodeURIComponent(aiReply)}`;
    document.getElementById("resultBox").innerHTML = `
      <br>
      <a href="${t}" target="_blank" style="color: #2196f3; font-weight: bold;">
        🤖 AIの提案を別ページで見る
      </a>
    `;
  })
  .catch(error => {
    console.error("エラー", error);
  });
}

// DOMセクション
document.addEventListener('DOMContentLoaded', function() {
  let finalSelections = {
    selectedCountry: null,
    selectedMain: null,
    selectedMainDish: null
  };

  function setupRandomSelector(buttonId, displayId, items, key) {
    const button = document.getElementById(buttonId);
    const display = document.getElementById(displayId);
    let selectedIndexes = [];

    button.addEventListener("click", function () {
      if (selectedIndexes.length === items.length) {
        selectedIndexes = [];
        console.log("全て表示されたのでリセットします。");
      }

      let number;
      do {
        number = Math.floor(Math.random() * items.length);
      } while (selectedIndexes.includes(number));

      selectedIndexes.push(number);
      const result = items[number];
      display.textContent = result;
      finalSelections[key] = result;

      checkAllSelections();
    });
  }

  function checkAllSelections() {
    const values = Object.values(finalSelections);
    const allSelected = values.every(value => value !== null);

    if (allSelected) {
      setTimeout(() => {
        const resultText = `今日のご飯は…<br>
          🍽️ <strong>ジャンル：</strong>${finalSelections.selectedCountry}<br>
          🍞 <strong>主食：</strong>${finalSelections.selectedMain}<br>
          🍖 <strong>メイン：</strong>${finalSelections.selectedMainDish}<br>
          <button id="askAIButton">AIにレシピ聞く</button>`;

          const resultBox = document.getElementById("resultBox");
          resultBox.innerHTML = resultText;
          resultBox.classList.add("show");

          const askAIButton = document.getElementById("askAIButton");
      askAIButton.addEventListener("click", () => {

        const message = `${finalSelections.selectedCountry}の料理で、主食は${finalSelections.selectedMain}、メインは${finalSelections.selectedMainDish}のレシピを教えて`;
        sendToDify(finalSelections);
        // AIとの連携処理などをここに記述（例: fetchでAPI呼び出し）
        alert("AIにレシピを聞いています。:\n\n" + message);
      });

          

          setTimeout(() => {
            resultBox.classList.remove("show");
            resultBox.innerHTML = "";
            resetAll();
      },50000);
          }, 200);
    }
  }

  function resetAll() {
    finalSelections = {
      selectedCountry: null,
      selectedMain: null,
      selectedMainDish: null
    };

    document.getElementById("selectedCountry").textContent = "";
    document.getElementById("selectedMain").textContent = "";
    document.getElementById("selectedMainDish").textContent = "";
    }

    document.getElementById("askAIButton").addEventListener("click", function () {
      const values = Object.values(finalSelections);
      const allSelected = values.every(value => value !== null);
    
      if (allSelected) {
        sendToDify(finalSelections);
      } else {
        alert("全ての項目を選んでからAIに聞いて下さい");
      }
    });

    setupRandomSelector("selectCountryButton", "selectedCountry", ["中華", "イタリアン", "和食", "アメリカ"], "selectedCountry");
    setupRandomSelector("selectMainButton", "selectedMain", ["白米", "和めん", "パスタ", "ぱん"], "selectedMain");
    setupRandomSelector("selectMainDishButton", "selectedMainDish", ["鶏肉", "牛肉", "豚肉", "魚", "魚介（魚以外"], "selectedMainDish");
})


// おまけセクション
// Swiperセクション
const defaultOptions = {
  // ドットインジケーターの表示
  pagination: {
    el: ".swiper-pagination",
    clickable: true,
  },
  // 前後スライドボタンを表示
  navigation: {
    nextEl: ".swiper-button-next",
    prevEl: ".swiper-button-prev",
  },
  loop: true, // ループの有効化
  slidesPerView: 1,
}

// デフォルトの表示
const swiper = new Swiper(".sample-swiper .swiper-container", {
  ...defaultOptions,
});

// フェードエフェクト
const swiperFade = new Swiper(".sample-swiper-fade .swiper-container", {
  ...defaultOptions,

  effect: "fade",
  fadeEffect: {
    crossFade: true
  },
});

// カバーフローエフェクト
const swiperCoverflow = new Swiper(".sample-swiper-coverflow .swiper-container", {
  ...defaultOptions,

  slidesPerView: 1.6, // 表示するスライドの枚数
  centeredSlides : true, // スライドを中央揃えを有効化
  effect: "coverflow",
  coverflowEffect: {
    rotate: 0, // スライドの回転角度
    stretch: 50, // スライドの間隔（px単位）
    depth: 200, // 奥行きの設定（translateをZ方向にpx単位で移動）
    slideShadows : true, // 先頭スライドの影を有効化
  },
});

// カードエフェクト
const swiperCards = new Swiper(".sample-swiper-cards .swiper-container", {
  ...defaultOptions,

  grabCursor: true,
  effect: "cards",
});

// クリエイティブエフェクト
const swiperCreative = new Swiper(".sample-swiper-creative .swiper-container", {
  ...defaultOptions,

  grabCursor: true,
  effect: "creative",
  creativeEffect: {
    prev: { // 表示しているスライドの移動先
      shadow: true, // 影の有効化
      translate: [0, 0, -400], // translateをX,Y,Zで指定
    },
    next: { // 次に表示されるスライドの設定
      translate: ["100%", 0, 0], // translateをX,Y,Zで指定
    },
  },
});

