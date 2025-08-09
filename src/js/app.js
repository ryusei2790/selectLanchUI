// // "use strict";
// document.addEventListener('DOMContentLoaded', async function() {
//     console.log("DOM読み込み完了");

// const { reset } = require("browser-sync");

  
//     // 3秒待つPromise関数
//     function delay(ms) {
//       return new Promise(resolve => setTimeout(resolve, ms));
//     }
  
//     // 非同期関数で待機
//     await delay(30000);
  
//     const overlay = document.getElementById('loadingOverlay');
//     overlay.style.display = 'none';
//     console.log("オーバーレイ非表示");
//   });

function sendToDify(selections) {
  console.log("送信開始");
  fetch('http://localhost:3001/send-to-dify', {
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
  }).then(data => {
    const aiReply = data.data.outputs.result;
    console.log("Difyの返答", aiReply);

    const encoded = encodeURIComponent(aiReply);
    const resultUrl = `/result.html?ai=${encoded}`;

   

    const resultBox = document.getElementById("resultBox");
    resultBox.innerHTML = `
    v<br>
    <a href="${resultUrl}" target="_blank" style="color: #2196f3; font-weight: bold;">
      🤖 AIの提案を別ページで見る
    </a>
    `;
  

    // const resultBox = document.getElementById("resultBox");

    // const aiSection = document.createElement("div");
    // aiSection.classList.add("ai-reply");
    // aiSection.innerHTML = `
    // <br>
    // <div style="padding: 1em; margin-top: 1em; background: #f3faff; border-left: 5px solid #2196f3;">
    //   🤖 <strong>AIの提案</strong><br>
    //   ${aiReply}
    // </div>
    // `;

    // resultBox.appendChild(aiSection);
  })
  .catch(error => {
    console.error("エラー", error);
  });
}

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








// $('.dishImages1').slick({
//   centerMode: true,
//   centerPadding: '60px',
//   slidesToShow: 3,
//   responsive: [
//     {
//       breakpoint: 768,
//       settings: {
//         arrows: false,
//         centerMode: true,
//         centerPadding: '40px',
//         slidesToShow: 3
//       }
//     },
//     {
//       breakpoint: 480,
//       settings: {
//         arrows: false,
//         centerMode: true,
//         centerPadding: '40px',
//         slidesToShow: 1
//       }
//     }
//   ]
// });




// indexページアニメーション
// const swiperCards = new Swiper(".sample-swiper-cards .swiper-container", {
//   pagination: {
//     el: ".swiper-pagination",
//     clickable: true,
//   },
//   navigation: {
//     nextEl: ".swiper-button-next",
//     prevEl: ".swiper-button-prev",
//   },
//   loop: true,
//   grabCursor: true,
//   effect: "cards",
// });

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