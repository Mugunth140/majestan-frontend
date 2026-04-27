import { LegacyHtmlFragment } from "@/components/site/layout/legacy-html-fragment";

const html = `<section class="flat-title style-2">
    <div class="tf-container">
        <div class="row">
            <div class="col-lg-12">
                <div class="title-inner ">
                    <ul class="breadcrumb">
                        <li><a class="home fw-6 text-color-3" href="index.php">Home</a></li>
                        <li>Projects</li>
                    </ul>
                </div>
                <div class="wg-filter style-2 relative z-31">
                    <div class="form-title style-2">
                        <!-- <form>
                            <fieldset>
                                <input type="text" placeholder="Address, City, ZIP...">
                            </fieldset>
                        </form> -->
                        <div class="nice-select" tabindex="0">
                            <span class="current">Status</span>
                            <ul class="list">
                                <li data-value class="option selected">Status</li>
                                <li data-value="bungalow" class="option">New Launch</li>
                                <li data-value="apartment" class="option">Ready to Move</li>
                                <li data-value="house" class="option">Affordable</li>

                            </ul>
                        </div>
                        <div class="nice-select" tabindex="0">
                            <span class="current">Property Type</span>
                            <ul class="list">
                                <li data-value="1" class="option">Type</li>
                                <li data-value="bungalow" class="option">Apartments</li>
                                <li data-value="bungalow" class="option">Villa</li>
                                <li data-value="apartment" class="option">Independent House</li>
                                <li data-value="house" class="option">Plots</li>
                                <li data-value="smart-home" class="option">Commercial Space</li>
                                <li data-value="Single family home" class="option">Industrial</li>
                                <li data-value="Multi family home" class="option">Farmlands</li>
                            </ul>
                        </div>
                        <div class="nice-select" tabindex="0">
                            <span class="current">Listing type</span>
                            <ul class="list">
                                <li data-value="" class="option focus">Projects</li>
                                <li data-value="" class="option">Buy</li>
                                <li data-value="" class="option">Rent</li>
                                <li data-value="" class="option">Resale</li>
                            </ul>
                        </div>
                        <!-- <div class="nice-select" tabindex="0">
                            <span class="current">Beds</span>
                            <ul class="list">
                                <li data-value="" class="option selected focus">Beds</li>
                                <li data-value="twin" class="option">Twin beds</li>
                                <li data-value="bunk" class="option">Bunk beds</li>
                                <li data-value="kids" class="option">Kids beds</li>
                                <li data-value="single" class="option">Single bed</li>
                            </ul>
                        </div> -->
                        <div class="wrap-btn">
                            <div class="btn-filter show-form">
                                <div class="icons">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                                        xmlns="http://www.w3.org/2000/svg">
                                        <path d="M21 4H14" stroke="#F1913D" stroke-width="2" stroke-linecap="round"
                                            stroke-linejoin="round" />
                                        <path d="M10 4H3" stroke="#F1913D" stroke-width="2" stroke-linecap="round"
                                            stroke-linejoin="round" />
                                        <path d="M21 12H12" stroke="#F1913D" stroke-width="2" stroke-linecap="round"
                                            stroke-linejoin="round" />
                                        <path d="M8 12H3" stroke="#F1913D" stroke-width="2" stroke-linecap="round"
                                            stroke-linejoin="round" />
                                        <path d="M21 20H16" stroke="#F1913D" stroke-width="2" stroke-linecap="round"
                                            stroke-linejoin="round" />
                                        <path d="M12 20H3" stroke="#F1913D" stroke-width="2" stroke-linecap="round"
                                            stroke-linejoin="round" />
                                        <path d="M14 2V6" stroke="#F1913D" stroke-width="2" stroke-linecap="round"
                                            stroke-linejoin="round" />
                                        <path d="M8 10V14" stroke="#F1913D" stroke-width="2" stroke-linecap="round"
                                            stroke-linejoin="round" />
                                        <path d="M16 18V22" stroke="#F1913D" stroke-width="2" stroke-linecap="round"
                                            stroke-linejoin="round" />
                                    </svg>
                                </div>
                            </div>
                            <a href="#" class="tf-btn bg-color-primary pd-3 fw-6">
                                Search <i class="icon-MagnifyingGlass fw-6"></i>
                            </a>
                        </div>
                    </div>
                    <div class="wd-search-form">
                        <!-- <div class="group-price">
                            <div class="widget-price">
                                <div class="box-title-price">
                                    <span class="title-price">Price range</span>
                                    <div class="caption-price">
                                        <span>from</span>
                                        <span class="value fw-6" id="slider-range-value1"></span>
                                        <span>to</span>
                                        <span class="value fw-6" id="slider-range-value2"></span>
                                    </div>
                                </div>
                                <div id="slider-range"></div>
                                <div class="slider-labels">
                                    <div>
                                        <input type="hidden" name="min-value" value="">
                                        <input type="hidden" name="max-value" value="">
                                    </div>
                                </div>
                            </div>
                            <div class="widget-price">
                                <div class="box-title-price">
                                    <span class="title-price">Size range</span>
                                    <div class="caption-price">
                                        <span>from</span>
                                        <span class="value fw-6" id="slider-range-value01"></span>
                                        <span>to</span>
                                        <span class="value fw-6" id="slider-range-value02"></span>
                                    </div>
                                </div>
                                <div id="slider-range2"></div>
                                <div class="slider-labels">
                                    <div>
                                        <input type="hidden" name="min-value2" value="">
                                        <input type="hidden" name="max-value2" value="">
                                    </div>
                                </div>
                            </div>
                        </div> -->
                        <div class=" group-select">
                            <div class="box-select">
                                <div class="nice-select" tabindex="0">
                                    <span class="current">Select your Budget</span>
                                    <ul class="list">
                                        <li data-value="1" class="option">Under 40 lakhs</li>
                                        <li data-value="2" class="option">40 lakhs - 70 lakhs</li>
                                        <li data-value="3" class="option">70 lakhs - 1 Crore</li>
                                        <li data-value="4" class="option">Above 2 Crore</li>
                                    </ul>
                                </div>
                            </div>
                            <div class="box-select">
                                <div class="nice-select" tabindex="0">
                                    <span class="current">Various Unit Types</span>
                                    <ul class="list">
                                        <li data-value="1" class="option">1 BHK</li>
                                        <li data-value="2" class="option">2 BHK</li>
                                        <li data-value="3" class="option">3 BHK</li>
                                        <li data-value="4" class="option">4 BHK</li>
                                        <li data-value="5" class="option">4+ BHK</li>
                                    </ul>
                                </div>
                            </div>
                            <div class="box-select">
                                <div class="nice-select" tabindex="0">
                                    <span class="current">Possession</span>
                                    <ul class="list">
                                        <li data-value="1" class="option">Ready to Move</li>
                                        <li data-value="2" class="option">Ready to Move</li>
                                        <li data-value="3" class="option">In 1 Year</li>
                                        <li data-value="4" class="option">In 2 Year</li>
                                    </ul>
                                </div>
                            </div>
                            <div class="box-select">
                                <div class="nice-select" tabindex="0">
                                    <span class="current">Listed By</span>
                                    <ul class="list">
                                        <li data-value="1" class="option">Owner</li>
                                        <li data-value="2" class="option">Agent</li>
                                        <li data-value="3" class="option">Developers</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div class="group-checkbox">
                            <div class=" title text-4 fw-6">Amenities:</div>
                            <div class="group-amenities ">
                                <fieldset class="checkbox-item style-1  ">
                                    <label>
                                        <span class="text-4">Bed linens</span>
                                        <input type="checkbox">
                                        <span class="btn-checkbox"></span>
                                    </label>
                                </fieldset>
                                <fieldset class="checkbox-item style-1   mt-12">
                                    <label>
                                        <span class="text-4"> Carbon alarm</span>
                                        <input type="checkbox">
                                        <span class="btn-checkbox"></span>
                                    </label>
                                </fieldset>
                                <fieldset class="checkbox-item style-1   mt-12">
                                    <label>
                                        <span class="text-4">Check-in lockbox </span>
                                        <input type="checkbox">
                                        <span class="btn-checkbox"></span>
                                    </label>
                                </fieldset>
                                <fieldset class="checkbox-item style-1   mt-12">
                                    <label>
                                        <span class="text-4">Coffee maker </span>
                                        <input type="checkbox">
                                        <span class="btn-checkbox"></span>
                                    </label>
                                </fieldset>
                                <fieldset class="checkbox-item style-1  ">
                                    <label>
                                        <span class="text-4"> Dishwasher</span>
                                        <input type="checkbox">
                                        <span class="btn-checkbox"></span>
                                    </label>
                                </fieldset>
                                <fieldset class="checkbox-item style-1   mt-12">
                                    <label>
                                        <span class="text-4"> Fireplace</span>
                                        <input type="checkbox">
                                        <span class="btn-checkbox"></span>
                                    </label>
                                </fieldset>
                                <fieldset class="checkbox-item style-1   mt-12">
                                    <label>
                                        <span class="text-4">Extra pillows </span>
                                        <input type="checkbox">
                                        <span class="btn-checkbox"></span>
                                    </label>
                                </fieldset>
                                <fieldset class="checkbox-item style-1   mt-12">
                                    <label>
                                        <span class="text-4">First aid kit </span>
                                        <input type="checkbox">
                                        <span class="btn-checkbox"></span>
                                    </label>
                                </fieldset>

                                <fieldset class="checkbox-item style-1  ">
                                    <label>
                                        <span class="text-4">Hangers </span>
                                        <input type="checkbox">
                                        <span class="btn-checkbox"></span>
                                    </label>
                                </fieldset>
                                <fieldset class="checkbox-item style-1   mt-12">
                                    <label>
                                        <span class="text-4">Iron</span>
                                        <input type="checkbox">
                                        <span class="btn-checkbox"></span>
                                    </label>
                                </fieldset>
                                <fieldset class="checkbox-item style-1   mt-12">
                                    <label>
                                        <span class="text-4"> Microwave</span>
                                        <input type="checkbox">
                                        <span class="btn-checkbox"></span>
                                    </label>
                                </fieldset>
                                <fieldset class="checkbox-item style-1   mt-12">
                                    <label>
                                        <span class="text-4">Fireplace</span>
                                        <input type="checkbox">
                                        <span class="btn-checkbox"></span>
                                    </label>
                                </fieldset>

                                <fieldset class="checkbox-item style-1  ">
                                    <label>
                                        <span class="text-4"> Refrigerator</span>
                                        <input type="checkbox">
                                        <span class="btn-checkbox"></span>
                                    </label>
                                </fieldset>
                                <fieldset class="checkbox-item style-1   mt-12">
                                    <label>
                                        <span class="text-4">Security cameras </span>
                                        <input type="checkbox">
                                        <span class="btn-checkbox"></span>
                                    </label>
                                </fieldset>
                                <fieldset class="checkbox-item style-1   mt-12">
                                    <label>
                                        <span class="text-4"> Smoke alarm</span>
                                        <input type="checkbox">
                                        <span class="btn-checkbox"></span>
                                    </label>
                                </fieldset>
                                <fieldset class="checkbox-item style-1   mt-12">
                                    <label>
                                        <span class="text-4">Fireplace </span>
                                        <input type="checkbox">
                                        <span class="btn-checkbox"></span>
                                    </label>
                                </fieldset>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>
<!-- /flat-title -->


<div class="main-content">

    <section class="section-property-layout ">
        <div class="tf-container">
            <div class="row">
                <div class="col-12">

                    <div class="box-title">
                        <h2>Property listing</h2>
                        <div class="right">

                            <div class="nice-select select-filter list-sort" tabindex="0"><span class="current">Sort by
                                    (Default)</span>
                                <ul class="list">
                                    <li data-value="default" class="option selected">Sort by (Default)</li>
                                    <li data-value="new" class="option">Newest</li>
                                    <li data-value="old" class="option">Oldest</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div class="flat-animate-tab">
                        <div class="tab-content">
                            <div class="tab-pane active show" id="gridLayout" role="tabpanel">
                                <div class="tf-grid-layout md-col-3">
                                    <div class="box-house hover-img">
                                        <div class="image-wrap">
                                            <a href="singanallur.php">
                                                <img class="lazyload" data-src="/assets/images/section/box-house.jpg"
                                                    src="/assets/images/section/box-house.jpg" alt="">
                                            </a>
                                        </div>
                                        <div class="content">
                                            <h5 class="title">
                                                <a href="singanallur.php">Singanallur</a>

                                            </h5>
                                            <p class="location text-1 flex items-center gap-6">
                                                <i class="icon-location"></i> Flat for Sale in Singanallur, Coimbatore
                                            </p>
                                            <ul class="meta-list flex">
                                                <li class="text-1 flex"><span>2</span>BHK</li>
                                                <li class="text-1 flex"><span>Apartment</span></li>
                                                <li class="text-1 flex"><span>1325</span>Sqft</li>
                                            </ul>
                                            <div class="bot flex justify-between items-center">
                                                <h5 class="price">
                                                    ₹ 66 L
                                                </h5>
                                                <div class="wrap-btn flex">
                                                    <a href="singanallur.php"
                                                        class="tf-btn style-border pd-4">Details</a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="box-house hover-img">
                                        <div class="image-wrap">
                                            <a href="singanallur.php">
                                                <img class="lazyload" data-src="/assets/images/section/box-house.jpg"
                                                    src="/assets/images/section/box-house.jpg" alt="">
                                            </a>
                                        </div>
                                        <div class="content">
                                            <h5 class="title">
                                                <a href="singanallur.php">KRG Nagar</a>

                                            </h5>
                                            <p class="location text-1 flex items-center gap-6">
                                                <i class="icon-location"></i> Flat for Sale in KRG Nagar, Coimbatore
                                            </p>
                                            <ul class="meta-list flex">
                                                <li class="text-1 flex"><span>4</span>BHK</li>
                                                <li class="text-1 flex"><span>Apartment</span></li>
                                                <li class="text-1 flex"><span>32845</span>Sqft</li>
                                            </ul>
                                            <div class="bot flex justify-between items-center">
                                                <h5 class="price">
                                                    Price on Request
                                                </h5>
                                                <div class="wrap-btn flex">
                                                    <a href="singanallur.php"
                                                        class="tf-btn style-border pd-4">Details</a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="box-house hover-img">
                                        <div class="image-wrap">
                                            <a href="#">
                                                <img class="lazyload" data-src="/assets/images/section/box-house.jpg"
                                                    src="/assets/images/section/box-house.jpg" alt="">
                                            </a>
                                        </div>
                                        <div class="content">
                                            <h5 class="title">
                                                <a href="#">Vakaman Kota Goldfields</a>

                                            </h5>
                                            <p class="location text-1 flex items-center gap-6">
                                                <i class="icon-location"></i> Avinashi Road, Coimbatore
                                            </p>
                                            <ul class="meta-list flex">
                                                <li class="text-1 flex"><span>4</span>BHK</li>
                                                <li class="text-1 flex"><span>Villa</span></li>
                                                <li class="text-1 flex"><span>3882 - 4348</span>Sqft</li>
                                            </ul>
                                            <div class="bot flex justify-between items-center">
                                                <h5 class="price">
                                                    Price on Request
                                                </h5>
                                                <div class="wrap-btn flex">
                                                    <a href="#" class="tf-btn style-border pd-4">Details</a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="box-house hover-img">
                                        <div class="image-wrap">
                                            <a href="#">
                                                <img class="lazyload" data-src="/assets/images/section/box-house.jpg"
                                                    src="/assets/images/section/box-house.jpg" alt="">
                                            </a>
                                        </div>
                                        <div class="content">
                                            <h5 class="title">
                                                <a href="#">Noble Kings Court</a>

                                            </h5>
                                            <p class="location text-1 flex items-center gap-6">
                                                <i class="icon-location"></i> Avinashi Road, Coimbatore
                                            </p>
                                            <ul class="meta-list flex">
                                                <li class="text-1 flex"><span>3,4</span>BHK</li>
                                                <li class="text-1 flex"><span>Villa</span></li>
                                                <li class="text-1 flex"><span>3882 - 4348</span>Sqft</li>
                                            </ul>
                                            <div class="bot flex justify-between items-center">
                                                <h5 class="price">
                                                    Price on Request
                                                </h5>
                                                <div class="wrap-btn flex">
                                                    <a href="#" class="tf-btn style-border pd-4">Details</a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="box-house hover-img">
                                        <div class="image-wrap">
                                            <a href="#">
                                                <img class="lazyload" data-src="/assets/images/section/box-house.jpg"
                                                    src="/assets/images/section/box-house.jpg" alt="">
                                            </a>
                                        </div>
                                        <div class="content">
                                            <h5 class="title">
                                                <a href="#">MTP Road</a>

                                            </h5>
                                            <p class="location text-1 flex items-center gap-6">
                                                <i class="icon-location"></i>MTP Road, Coimbatore
                                            </p>
                                            <ul class="meta-list flex">
                                                <li class="text-1 flex"><span>Plot Area</span></li>
                                                <li class="text-1 flex"><span>1055</span>Sq.Mt</li>
                                            </ul>
                                            <div class="bot flex justify-between items-center">
                                                <h5 class="price">
                                                    ₹ 5.2 Cr
                                                </h5>
                                                <div class="wrap-btn flex">
                                                    <a href="#" class="tf-btn style-border pd-4">Details</a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="box-house hover-img">
                                        <div class="image-wrap">
                                            <a href="#">
                                                <img class="lazyload" data-src="/assets/images/section/box-house.jpg"
                                                    src="/assets/images/section/box-house.jpg" alt="">
                                            </a>
                                        </div>
                                        <div class="content">
                                            <h5 class="title">
                                                <a href="#">Kurichi</a>

                                            </h5>
                                            <p class="location text-1 flex items-center gap-6">
                                                <i class="icon-location"></i>Kurichi, Coimbatore
                                            </p>
                                            <ul class="meta-list flex">
                                                <li class="text-1 flex"><span>Warehouse</span></li>
                                                <li class="text-1 flex"><span>4000</span>Sqft</li>
                                            </ul>
                                            <div class="bot flex justify-between items-center">
                                                <h5 class="price">
                                                    ₹ 60,000
                                                </h5>
                                                <div class="wrap-btn flex">
                                                    <a href="#" class="tf-btn style-border pd-4">Details</a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="box-house hover-img">
                                        <div class="image-wrap">
                                            <a href="#">
                                                <img class="lazyload" data-src="/assets/images/section/box-house.jpg"
                                                    src="/assets/images/section/box-house.jpg" alt="">
                                            </a>
                                        </div>
                                        <div class="content">
                                            <h5 class="title">
                                                <a href="#">Vangapalli</a>

                                            </h5>
                                            <p class="location text-1 flex items-center gap-6">
                                                <i class="icon-location"></i>Coimbatore
                                            </p>
                                            <ul class="meta-list flex">
                                                <li class="text-1 flex"><span>Farmland Mango Tree's</span></li>
                                                <li class="text-1 flex"><span>242</span>Sq.Yd</li>
                                            </ul>
                                            <div class="bot flex justify-between items-center">
                                                <h5 class="price">
                                                    Price on Request
                                                </h5>
                                                <div class="wrap-btn flex">
                                                    <a href="#" class="tf-btn style-border pd-4">Details</a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="box-house hover-img">
                                        <div class="image-wrap">
                                            <a href="#">
                                                <img class="lazyload" data-src="/assets/images/section/box-house.jpg"
                                                    src="/assets/images/section/box-house.jpg" alt="">
                                            </a>
                                        </div>
                                        <div class="content">
                                            <h5 class="title">
                                                <a href="#">Thudiyalur</a>

                                            </h5>
                                            <p class="location text-1 flex items-center gap-6">
                                                <i class="icon-location"></i>Thudiyalur, Coimbatore
                                            </p>
                                            <ul class="meta-list flex">
                                                <li class="text-1 flex"><span>2</span>BHK</li>
                                                <li class="text-1 flex"><span>Indipendent House</span></li>
                                                <li class="text-1 flex"><span>3500</span>Sq.Sqft</li>
                                            </ul>
                                            <div class="bot flex justify-between items-center">
                                                <h5 class="price">
                                                    ₹1.3 Cr
                                                </h5>
                                                <div class="wrap-btn flex">
                                                    <a href="#" class="tf-btn style-border pd-4">Details</a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="box-house hover-img">
                                        <div class="image-wrap">
                                            <a href="#">
                                                <img class="lazyload" data-src="/assets/images/section/box-house.jpg"
                                                    src="/assets/images/section/box-house.jpg" alt="">
                                            </a>
                                        </div>
                                        <div class="content">
                                            <h5 class="title">
                                                <a href="#">Race Course</a>

                                            </h5>
                                            <p class="location text-1 flex items-center gap-6">
                                                <i class="icon-location"></i>Race Course, Coimbatore
                                            </p>
                                            <ul class="meta-list flex">
                                                <li class="text-1 flex"><span>Commercial Space</span></li>
                                                <li class="text-1 flex"><span>5500</span>Sqft</li>
                                            </ul>
                                            <div class="bot flex justify-between items-center">
                                                <h5 class="price">
                                                    ₹8.5 Cr
                                                </h5>
                                                <div class="wrap-btn flex">
                                                    <a href="#" class="tf-btn style-border pd-4">Details</a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>


                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="wrap-pagination">
                        <p class="text-1">Showing 1-8 of 42 results.</p>
                        <ul class="wg-pagination ">
                            <li class="arrow">
                                <a href="#"><i class="icon-arrow-left"></i></a>
                            </li>
                            <li>
                                <a href="#">1</a>
                            </li>
                            <li class="active">
                                <a href="#">2</a>
                            </li>

                            <li>
                                <a href="#">...</a>
                            </li>
                            <li>
                                <a href="#">20</a>
                            </li>
                            <li class="arrow">
                                <a href="#"><i class="icon-arrow-right"></i></a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- section-CTA -->
    <section class="section-CTA">
        <div class="tf-container">
            <div class="row">
                <div class="col-12">
                    <div class="content-inner">
                        <img src="/assets/images/section/cta.png" alt="">
                        <div class="content">
                            <h4 class="text-white mb-8 ">Find a Local Real Estate Agent Today</h4>
                            <p class="text-white text-1">If you’re looking to buy or sell a home. We’ll help you
                                make
                                the most money
                                possible.</p>
                        </div>
                        <a href="#" class="tf-btn style-2 fw-6 ">Find your location agent <i
                                class="icon-MagnifyingGlass fw-6"></i></a>
                    </div>
                </div>
            </div>
        </div>
    </section>
    <!-- /section-CTA -->
</div>`;

export function ProjectsView(): React.JSX.Element {
  return <LegacyHtmlFragment html={html} />;
}
