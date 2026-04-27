function isElementInViewport($el) {
    var top = $el.offset().top;
    var bottom = top + $el.outerHeight();
    var viewportTop = $(window).scrollTop();
    var viewportBottom = viewportTop + $(window).height();
    return bottom > viewportTop && top < viewportBottom;
}

if ($(".counter-scroll").length > 0) {
    $(window).on("scroll", function () {
        if ($(".odometer").length > 0) {
            if (isElementInViewport($(".odometer"))) {
                setTimeout(function () {
                    $(".style-1-1").html(26);
                    $(".style-1-2").html(4130);
                    $(".style-1-3").html(98);
                    $(".style-1-4").html(1780);
                }, 0);
            }
        }
        if ($(".odometer.style-2").length > 0) {
            if (isElementInViewport($(".odometer.style-2"))) {
                setTimeout(function () {
                    $(".style-2-1").html(900);
                    $(".style-2-2").html(287);
                    $(".style-2-3").html(3);
                }, 0);
            }
        }
    });
}
