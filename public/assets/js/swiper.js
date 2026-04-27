if ($(".brand-slide").length > 0) {
    var preview = $(".brand-slide").data("preview");
    var tablet = $(".brand-slide").data("tablet");
    var mobile = $(".brand-slide").data("mobile");
    var mobileSm = $(".brand-slide").data("mobile-sm");
    var spacing = $(".brand-slide").data("space");
    var spacingMd = $(".brand-slide").data("space-md");
    var spacingLg = $(".brand-slide").data("space-lg");
    var swiper = new Swiper(".brand-slide", {
        autoplay: {
            delay: 0,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
        },
        slidesPerView: preview,
        spaceBetween: spacing,
        loop: true,
        speed: 3000,
        breakpoints: {
            0: {
                slidesPerView: mobile,
                spaceBetween: 15,
            },
            575: {
                slidesPerView: mobileSm,
                spaceBetween: 15,
            },
            768: {
                slidesPerView: tablet,
                spaceBetween: spacingMd,
            },

            1200: {
                slidesPerView: preview,
                spaceBetween: spacingLg,
            },
        },
    });
    $(".brand-slide").hover(
        function () {
            this.swiper.autoplay.stop();
        },
        function () {
            this.swiper.autoplay.start();
        }
    );
}

if ($(".tf-sw-mobile-1").length > 0) {
    let swiperMb;
    let screenWidth = $(".tf-sw-mobile-1").data("screen");
    function initSwiperMb() {
        if (
            matchMedia(`only screen and (max-width: ${screenWidth}px)`).matches
        ) {
            if (!swiperMb) {
                let preview = $(".tf-sw-mobile-1").data("preview");
                let spacing = $(".tf-sw-mobile-1").data("space");
                swiperMb = new Swiper(".tf-sw-mobile-1", {
                    slidesPerView: preview,
                    spaceBetween: spacing,
                    speed: 1000,
                    pagination: {
                        el: ".sw-pagination-mb-1",
                        clickable: true,
                    },
                    navigation: {
                        clickable: true,
                        nextEl: ".nav-prev-mb-1",
                        prevEl: ".nav-next-mb-1",
                    },
                });
            }
        } else {
            if (swiperMb) {
                swiperMb.destroy(true, true);
                swiperMb = null;
                $(".tf-sw-mobile-1 .swiper-wrapper").removeAttr("style");
                $(".tf-sw-mobile-1 .swiper-slide").removeAttr("style");
            }
        }
    }

    initSwiperMb();
    window.addEventListener("resize", function () {
        initSwiperMb();
    });
}

if ($(".tf-sw-mobile").length > 0) {
    let swiperMb;
    let screenWidth = $(".tf-sw-mobile").data("screen");
    function initSwiperMb() {
        if (
            matchMedia(`only screen and (max-width: ${screenWidth}px)`).matches
        ) {
            if (!swiperMb) {
                let preview = $(".tf-sw-mobile").data("preview");
                let spacing = $(".tf-sw-mobile").data("space");
                swiperMb = new Swiper(".tf-sw-mobile", {
                    slidesPerView: preview,
                    spaceBetween: spacing,
                    speed: 1000,
                    pagination: {
                        el: ".sw-pagination-mb",
                        clickable: true,
                    },
                });
            }
        } else {
            if (swiperMb) {
                swiperMb.destroy(true, true);
                swiperMb = null;
                $(".tf-sw-mobile .swiper-wrapper").removeAttr("style");
                $(".tf-sw-mobile .swiper-slide").removeAttr("style");
            }
        }
    }

    initSwiperMb();
    window.addEventListener("resize", function () {
        initSwiperMb();
    });
}

if ($(".sw-layout-4").length > 0) {
    var preview = $(".sw-layout-4").data("preview");
    var tablet = $(".sw-layout-4").data("tablet");
    var mobile = $(".sw-layout-4").data("mobile");
    var mobileSm = $(".sw-layout-4").data("mobile-sm");
    var spacing = $(".sw-layout-4").data("space");
    var spacingMd = $(".sw-layout-4").data("space-md");
    var spacingLg = $(".sw-layout-4").data("space-lg");
    var speed = $(".sw-layout-4").data("speed");
    var swiper = new Swiper(".sw-layout-4", {
        slidesPerView: preview,
        spaceBetween: spacing,
        speed: speed,
        pagination: {
            el: ".sw-pagination-layout-4",
            clickable: true,
        },
        navigation: {
            clickable: true,
            nextEl: ".layout-4-next",
            prevEl: ".layout-4-prev",
        },
        breakpoints: {
            0: {
                slidesPerView: mobile,
                spaceBetween: spacing,
            },
            575: {
                slidesPerView: mobileSm,
                spaceBetween: spacing,
            },
            768: {
                slidesPerView: tablet,
                spaceBetween: spacingMd,
            },

            1200: {
                slidesPerView: preview,
                spaceBetween: spacingLg,
            },
        },
    });
}

if ($(".sw-layout-4-v2").length > 0) {
    var preview = $(".sw-layout-4-v2").data("preview");
    var tablet = $(".sw-layout-4-v2").data("tablet");
    var mobile = $(".sw-layout-4-v2").data("mobile");
    var mobileSm = $(".sw-layout-4-v2").data("mobile-sm");
    var spacing = $(".sw-layout-4-v2").data("space");
    var spacingMd = $(".sw-layout-4-v2").data("space-md");
    var spacingLg = $(".sw-layout-4-v2").data("space-lg");
    var speed = $(".sw-layout-4-v2").data("speed");
    var swiper = new Swiper(".sw-layout-4-v2", {
        slidesPerView: preview,
        spaceBetween: spacing,
        speed: speed,
        pagination: {
            el: ".sw-pagination-layout-4",
            clickable: true,
        },
        navigation: {
            clickable: true,
            nextEl: ".layout-4-next",
            prevEl: ".layout-4-prev",
        },
        breakpoints: {
            0: {
                slidesPerView: mobile,
                spaceBetween: spacing,
            },
            575: {
                slidesPerView: mobileSm,
                spaceBetween: spacing,
            },
            768: {
                slidesPerView: tablet,
                spaceBetween: spacingMd,
            },

            1200: {
                slidesPerView: preview,
                spaceBetween: spacingLg,
            },
        },
    });
}

if ($(".sw-layout-4-v3").length > 0) {
    var preview = $(".sw-layout-4-v3").data("preview");
    var tablet = $(".sw-layout-4-v3").data("tablet");
    var mobile = $(".sw-layout-4-v3").data("mobile");
    var mobileSm = $(".sw-layout-4-v3").data("mobile-sm");
    var desktop = $(".sw-layout-4-v3").data("desktop");
    var spacing = $(".sw-layout-4-v3").data("space");
    var spacingMd = $(".sw-layout-4-v3").data("space-md");
    var spacingLg = $(".sw-layout-4-v3").data("space-lg");
    var speed = $(".sw-layout-4-v3").data("speed");
    var swiper = new Swiper(".sw-layout-4-v3", {
        slidesPerView: preview,
        spaceBetween: spacing,
        speed: speed,
        pagination: {
            el: ".sw-pagination-layout-4",
            clickable: true,
        },
        navigation: {
            clickable: true,
            nextEl: ".layout-4-next",
            prevEl: ".layout-4-prev",
        },
        breakpoints: {
            0: {
                slidesPerView: mobile,
                spaceBetween: spacing,
            },
            575: {
                slidesPerView: mobileSm,
                spaceBetween: spacing,
            },
            768: {
                slidesPerView: tablet,
                spaceBetween: spacingMd,
            },

            1200: {
                slidesPerView: desktop,
                spaceBetween: spacingLg,
            },
            1500: {
                slidesPerView: preview,
                spaceBetween: spacingLg,
            },
        },
    });
}

if ($(".sw-layout-3").length > 0) {
    var preview = $(".sw-layout-3").data("preview");
    var tablet = $(".sw-layout-3").data("tablet");
    var mobile = $(".sw-layout-3").data("mobile");
    var mobileSm = $(".sw-layout-3").data("mobile-sm");
    var mobileMd = $(".sw-layout-3").data("mobile-md");
    var spacing = $(".sw-layout-3").data("space");
    var spacingMd = $(".sw-layout-3").data("space-md");
    var spacingLg = $(".sw-layout-3").data("space-lg");
    var speed = $(".sw-layout-3").data("speed");
    var swiper = new Swiper(".sw-layout-3", {
        slidesPerView: preview,
        spaceBetween: spacing,
        speed: speed,
        loop: true, // ✅ important for auto carousel

        autoplay: {
            delay: 3000,               // 3 seconds
            disableOnInteraction: false,
        },

        pagination: {
            el: ".sw-pagination-layout-3",
            clickable: true,
        },
        navigation: {
            clickable: true,
            nextEl: ".layout-3-next",
            prevEl: ".layout-3-prev",
        },
        breakpoints: {
            0: {
                slidesPerView: mobile,
                spaceBetween: spacing,
            },
            767: {
                slidesPerView: mobileSm,
                spaceBetween: spacing,
            },
            991: {
                slidesPerView: tablet,
                spaceBetween: spacingMd,
            },
            1200: {
                slidesPerView: preview,
                spaceBetween: spacingLg,
            },
        },
    });
}

if ($(".sw-testimonials").length > 0) {
    var preview = $(".sw-testimonials").data("preview");
    var tablet = $(".sw-testimonials").data("tablet");
    var mobile = $(".sw-testimonials").data("mobile");
    var mobileSm = $(".sw-testimonials").data("mobile-sm");
    var spacing = $(".sw-testimonials").data("space");
    var spacingMd = $(".sw-testimonials").data("space-md");
    var spacingLg = $(".sw-testimonials").data("space-lg");
    var speed = $(".sw-testimonials").data("speed");
    var swiper = new Swiper(".sw-testimonials", {
        slidesPerView: preview,
        spaceBetween: spacing,
        speed: speed,
        loop: true,

        autoplay: {
            delay: 3000, 
            disableOnInteraction: false,
            pauseOnMouseEnter: true
        },
        pagination: {
            el: ".sw-pagination-testimonials",
            clickable: true,
        },
        navigation: {
            clickable: true,
            nextEl: ".testimonials-next",
            prevEl: ".testimonials-prev",
        },
        breakpoints: {
            0: {
                slidesPerView: mobile,
                spaceBetween: spacing,
            },
            575: {
                slidesPerView: mobileSm,
                spaceBetween: spacing,
            },
            768: {
                slidesPerView: tablet,
                spaceBetween: spacingMd,
            },

            1200: {
                slidesPerView: preview,
                spaceBetween: spacingLg,
            },
        },
    });
}

if ($(".sw-thumbs-sigle").length > 0) {
    var preview = $(".sw-thumbs-sigle").data("preview");
    var spacing = $(".sw-thumbs-sigle").data("space");
    var speed = $(".sw-thumbs-sigle").data("speed");
    var swiper = new Swiper(".sw-thumbs-sigle", {
        slidesPerView: preview,
        spaceBetween: spacing,
        speed: speed,
        navigation: {
            clickable: true,
            nextEl: ".sw-thumbs-next",
            prevEl: ".sw-thumbs-prev",
        },
    });
}

if ($(".thumbs-sw-pagi").length > 0) {
    var preview = $(".thumbs-sw-pagi").data("preview");
    var spacing = $(".thumbs-sw-pagi").data("space");
    var mobile = $(".thumbs-sw-pagi").data("mobile");
    var mobileSm = $(".thumbs-sw-pagi").data("mobile-sm");

    var pagithumbs = new Swiper(".thumbs-sw-pagi", {
        spaceBetween: spacing,
        slidesPerView: preview,
        freeMode: true,
        watchSlidesProgress: true,
        breakpoints: {
            375: {
                slidesPerView: 3,
                spaceBetween: spacing,
            },
            500: {
                slidesPerView: mobileSm,
            },
        },
    });
}

var swiperSingle = new Swiper(".sw-single", {
    spaceBetween: 16,
    autoplay: {
        delay: 3000,
        disableOnInteraction: false,
    },
    speed: 500,
    effect: "fade",
    fadeEffect: {
        crossFade: true,
    },
    thumbs: {
        swiper: pagithumbs,
    },
    navigation: {
        clickable: true,
        nextEl: ".sw-thumbs-next",
        prevEl: ".sw-thumbs-prev",
    },
});

if ($(".tf-sw-latest").length > 0) {
    var preview = $(".tf-sw-latest").data("preview");
    var tablet = $(".tf-sw-latest").data("tablet");
    var mobile = $(".tf-sw-latest").data("mobile");
    var mobileSm = $(".tf-sw-latest").data("mobile-sm");
    var spacingLg = $(".tf-sw-latest").data("space-lg");
    var spacingMd = $(".tf-sw-latest").data("space-md");
    var spacing = $(".tf-sw-latest").data("space");
    var swiper = new Swiper(".tf-sw-latest", {
        slidesPerView: mobile,
        spaceBetween: spacing,
         loop: true,
        speed: 900,
        autoplay: {
            delay: 2000,
            disableOnInteraction: false,
        },
        pagination: {
            el: ".sw-pagination-latest",
            clickable: true,
        },
        navigation: {
            clickable: true,
            nextEl: ".nav-next-latest",
            prevEl: ".nav-prev-latest",
        },
        breakpoints: {
            575: {
                slidesPerView: mobileSm,
                spaceBetween: spacing,
            },
            768: {
                slidesPerView: tablet,
                spaceBetween: spacingMd,
            },
            1150: {
                slidesPerView: preview,
                spaceBetween: spacingLg,
            },
        },
    });
}

if ($(".tf-sw-categories").length > 0) {
    var preview = $(".tf-sw-categories").data("preview");
    var tablet = $(".tf-sw-categories").data("tablet");
    var mobile = $(".tf-sw-categories").data("mobile");
    var mobileSm = $(".tf-sw-categories").data("mobile-sm");

    var spacing = $(".tf-sw-categories").data("space");
    var spacingMd = $(".tf-sw-categories").data("space-md");
    var spacingLg = $(".tf-sw-categories").data("space-lg");
    var swiper = new Swiper(".tf-sw-categories", {
        slidesPerView: mobile,
        spaceBetween: spacing,
        navigation: {
            clickable: true,
            nextEl: ".nav-prev-category",
            prevEl: ".nav-next-category",
        },
        pagination: {
            el: ".sw-pagination-category",
            clickable: true,
        },
        breakpoints: {
            575: {
                slidesPerView: mobileSm,
                spaceBetween: spacing,
            },
            768: {
                slidesPerView: tablet,
                spaceBetween: spacingMd,
            },

            1200: {
                slidesPerView: preview,
                spaceBetween: spacingLg,
            },
        },
    });
}