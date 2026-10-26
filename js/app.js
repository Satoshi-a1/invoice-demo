// 請求書管理デモ — 静的JSON API を fetch して3カラムを描画する
(function () {
  "use strict";

  // 静的JSON API のベースパス（相対パスなので GitHub Pages のサブパスでも動作）
  var API_BASE = "api";

  var listEl = document.getElementById("invoice-list");
  var countEl = document.getElementById("list-count");
  var detailBody = document.getElementById("detail-body");
  var detailRegistered = document.getElementById("detail-registered");
  var viewerStage = document.getElementById("viewer-stage");

  // ---- フォーマッタ ----
  var yen = new Intl.NumberFormat("ja-JP", { style: "currency", currency: "JPY" });
  function formatYen(n) { return yen.format(n); }
  function formatNum(n) { return new Intl.NumberFormat("ja-JP").format(n); }
  function formatDate(iso) {
    // "2020-05-15T00:00:00" / "2020-05-10" のどちらも受け付ける
    var d = iso.slice(0, 10).split("-");
    return d[0] + "/" + d[1] + "/" + d[2];
  }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  // ---- API 呼び出し ----
  function fetchInvoices() {
    return fetch(API_BASE + "/invoices.json").then(function (r) {
      if (!r.ok) throw new Error("一覧の取得に失敗しました (" + r.status + ")");
      return r.json();
    });
  }
  function fetchInvoice(id) {
    return fetch(API_BASE + "/invoices/" + id + ".json").then(function (r) {
      if (!r.ok) throw new Error("請求書の取得に失敗しました (" + r.status + ")");
      return r.json();
    });
  }

  // ---- 一覧を描画 ----
  function renderList(data) {
    countEl.textContent = data.count + " 件";
    listEl.innerHTML = "";
    data.invoices.forEach(function (inv) {
      var li = document.createElement("li");
      li.className = "invoice-row";
      li.dataset.id = inv.id;
      li.innerHTML =
        '<span class="r-date">' + esc(formatDate(inv.registeredAt)) + "</span>" +
        '<span class="r-partner">' + esc(inv.partner) + "</span>" +
        '<span class="r-amount">' + esc(formatYen(inv.total)) + "</span>";
      li.addEventListener("click", function () { select(inv.id); });
      listEl.appendChild(li);
    });
  }

  // ---- 選択状態 ----
  function markSelected(id) {
    Array.prototype.forEach.call(listEl.children, function (li) {
      li.classList.toggle("is-selected", li.dataset.id === id);
    });
  }

  function select(id) {
    markSelected(id);
    detailBody.innerHTML = '<p class="placeholder">読み込み中…</p>';
    viewerStage.innerHTML = '<p class="placeholder">読み込み中…</p>';
    fetchInvoice(id)
      .then(function (inv) {
        renderDetail(inv);
        renderViewer(inv);
      })
      .catch(function (err) {
        detailBody.innerHTML = '<p class="placeholder">' + esc(err.message) + "</p>";
        viewerStage.innerHTML = "";
      });
  }

  // ---- 中央: 請求書情報 ----
  function renderDetail(inv) {
    detailRegistered.textContent = "登録日時: " + formatDate(inv.registeredAt) + " 0:00:00";
    var isOk = inv.qualifiedResult === "適格";
    detailBody.innerHTML =
      '<div class="judgment ' + (isOk ? "" : "is-ng") + '">' +
        '<span class="label">適格請求書の判定結果</span>' +
        '<span class="badge ' + (isOk ? "ok" : "ng") + '"><span class="dot"></span>' + esc(inv.qualifiedResult) + "</span>" +
      "</div>" +
      '<table class="field-table">' +
        row("事業者分類", esc(inv.businessType)) +
        row("取引先", esc(inv.partner)) +
        row("登録番号", esc(inv.registrationNumber)) +
        row("取引年月日", esc(formatDate(inv.transactionDate))) +
        row("軽減税率取引の有無", esc(inv.reducedTaxRate)) +
        row("請求金額", '<span class="amount-strong">' + esc(formatYen(inv.total)) + "</span>") +
      "</table>";
  }
  function row(th, tdHtml) {
    return "<tr><th>" + th + "</th><td>" + tdHtml + "</td></tr>";
  }

  // ---- 右: ビューワー（請求書の見た目を再現） ----
  function renderViewer(inv) {
    var rows = inv.items.map(function (it) {
      return "<tr>" +
        "<td>" + esc(it.name) + "</td>" +
        '<td class="num">' + esc(formatNum(it.unitPrice)) + "</td>" +
        '<td class="num">' + esc(formatNum(it.quantity)) + "</td>" +
        '<td class="num">' + esc(formatNum(it.amount)) + "</td>" +
      "</tr>";
    }).join("");

    viewerStage.innerHTML =
      '<div class="paper">' +
        '<div class="seal"></div>' +
        "<h1>請求書</h1>" +
        '<div><span class="to">' + esc(inv.partner) + " 御中</span></div>" +
        '<div class="meta">発行日: ' + esc(formatDate(inv.transactionDate)) + "<br>No. " + esc(inv.id) + "</div>" +
        '<div class="total-line">合計 <span class="yen">' + esc(formatYen(inv.total)) + "</span></div>" +
        '<table class="items">' +
          "<thead><tr><th>物品名</th><th>単価</th><th>数量</th><th>合計金額</th></tr></thead>" +
          "<tbody>" + rows + "</tbody>" +
        "</table>" +
        '<div class="sum">' +
          '<div class="row"><span>小計</span><span>' + esc(formatYen(inv.subtotal)) + "</span></div>" +
          '<div class="row"><span>消費税(10%)</span><span>' + esc(formatYen(inv.tax)) + "</span></div>" +
          '<div class="row grand"><span>合計</span><span>' + esc(formatYen(inv.total)) + "</span></div>" +
        "</div>" +
      "</div>";
  }

  // ---- 起動 ----
  fetchInvoices()
    .then(function (data) {
      renderList(data);
      if (data.invoices.length) select(data.invoices[0].id); // 先頭を自動選択
    })
    .catch(function (err) {
      listEl.innerHTML = "";
      countEl.textContent = "エラー";
      detailBody.innerHTML = '<p class="placeholder">' + esc(err.message) + "</p>";
    });
})();
