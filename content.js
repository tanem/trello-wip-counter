// Deliberate globals, we're operating in an isolated world.
var $headerLozenge;
var $listLozenges;
var frameId;
var isRunning = false;

// Start immediatly if the URL matches according to
// manifest.json:content_scripts.
start();

// Listen for messages from the background script, which will tell us when the
// URL has changed.
chrome.runtime.onMessage.addListener(start);

// There tends to be a spew of events, so we need to ensure we keep track of
// the running status.
function start(url) {
  if (!url || /q2gGORV8/.test(url)) {
    if (!isRunning) {
      isRunning = true;
      setup();
    }
  } else {
    isRunning = false;
    teardown();
  }
}

function setup() {
  const WIPLimit = 11;
  const refreshInterval = 3000;

  const $lists = selectList('Ready')
    .nextUntil(selectList('Deployed'));

  $headerLozenge = $('<span class="Lozenge Lozenge--header"></span>')
    .appendTo('.board-header-btns.mod-left');

  $listLozenges = $lists.map(function(){
    return $('<span class="Lozenge Lozenge--list"></span>')
      .insertBefore($(this).find('.list-header-extras'));
  });

  frameId = requestAnimationFrame(step);

  function step() {
    updateLozenges();
    frameId = requestAnimationFrame(step);
  }

  function updateLozenges() {
    const cardCounts = $lists
      .map(function(){
        return $(this)
          .find('.list-card')
          .length;
      })
      .toArray();

    const totalCardCount = cardCounts.reduce(function(acc, cardCount){
      return acc + cardCount;
    }, 0);

    $headerLozenge
      .text(`WIP: ${totalCardCount}/${WIPLimit}`)
      .toggleClass('is-over', totalCardCount > WIPLimit);

    $listLozenges.each(function(i){
      $(this)
        .text(cardCounts[i])
        .toggleClass('is-over', totalCardCount > WIPLimit);
    });
  }

  function selectList(nameStartsWith) {
    return $('.js-list-name-assist')
      .filter(function(){
        return $(this)
          .text()
          .startsWith(nameStartsWith);
      })
      .closest('.js-list');
  }
}

function teardown() {
  cancelAnimationFrame(frameId);
  $headerLozenge.remove();
  $listLozenges.each(function(){
    $(this).remove();
  });
}