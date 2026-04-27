import { LegacyHtmlFragment } from "@/components/site/layout/legacy-html-fragment";

const html = `<section class="flat-title style-2">
    <div class="tf-container">
        <div class="row">
            <div class="col-lg-12">
                <div class="title-inner ">
                    <ul class="breadcrumb">
                        <li><a class="home fw-6 text-color-3" href="/">Home</a></li>
                        <li>Laxury Real Estate</li>
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
                            <!-- <div class="btn-filter show-form">
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
                            </div> -->
                            <a href="#" class="tf-btn bg-color-primary pd-3 fw-6">
                                Search <i class="icon-MagnifyingGlass fw-6"></i>
                            </a>
                        </div>
                    </div>
                    <div class="wd-search-form">
                        <div class="group-price">
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
                        </div>
                        <div class=" group-select">
                            <div class="box-select">
                                <div class="nice-select" tabindex="0">
                                    <span class="current">Province / States</span>
                                    <ul class="list">
                                        <li data-value="1" class="option">California</li>
                                        <li data-value="2" class="option selected">Texas</li>
                                        <li data-value="3" class="option">Florida </li>
                                        <li data-value="4" class="option">New York
                                        </li>
                                        <li data-value="5" class="option">Illinois</li>
                                        <li data-value="6" class="option">Washington</li>
                                        <li data-value="7" class="option">Pennsylvania</li>
                                        <li data-value="8" class="option">Ohio</li>
                                        <li data-value="9" class="option">Georgia</li>
                                        <li data-value="10" class="option">North Carolina
                                        </li>
                                    </ul>
                                </div>
                            </div>
                            <div class="box-select">
                                <div class="nice-select" tabindex="0">
                                    <span class="current">Rooms</span>
                                    <ul class="list">
                                        <li data-value="1" class="option">1</li>
                                        <li data-value="2" class="option selected">2</li>
                                        <li data-value="3" class="option">3</li>
                                        <li data-value="4" class="option">4</li>
                                        <li data-value="5" class="option">5</li>
                                        <li data-value="6" class="option">6</li>
                                        <li data-value="7" class="option">7</li>
                                        <li data-value="8" class="option">8</li>
                                        <li data-value="9" class="option">9</li>
                                        <li data-value="10" class="option">10</li>
                                    </ul>
                                </div>
                            </div>
                            <div class="box-select">

                                <div class="nice-select" tabindex="0">
                                    <span class="current">Bath: Any</span>
                                    <ul class="list">
                                        <li data-value="1" class="option">1</li>
                                        <li data-value="2" class="option selected">2</li>
                                        <li data-value="3" class="option">3</li>
                                        <li data-value="4" class="option">4</li>
                                    </ul>
                                </div>
                            </div>
                            <div class="box-select">

                                <div class="nice-select" tabindex="0">
                                    <span class="current">Beds: Any</span>
                                    <ul class="list">
                                        <li data-value="1" class="option">1</li>
                                        <li data-value="2" class="option selected">2</li>
                                        <li data-value="3" class="option">3</li>
                                        <li data-value="4" class="option">4</li>
                                        <li data-value="5" class="option">5</li>
                                        <li data-value="6" class="option">6</li>
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

<!-- .main-content -->
<div class="main-content">

    <section class="section-property-layout ">
        <div class="tf-container">
            <div class="row">
                <!-- <div class="col-12">
                    <div class="box-title">
                        <h2>Properties</h2>
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
                </div> -->

                <div class="col-lg-4">
                    <div class="tf-sidebar">
                        <form class="property-filter form-advanced-search  mb-30">
                            <h4 class="heading-title mb-30">
                                Filter
                            </h4>
                            <!-- <fieldset class="mb-12">
                                <input type="text" class="form-control" required placeholder="Type keyword..."
                                    name="search" id="search" required>
                                <div class="icon ">
                                    <i class="icon-location1"></i>
                                </div>
                            </fieldset>
                            <fieldset class="mb-30">
                                <input type="text" class="form-control" required placeholder="Location" name="Location"
                                    id="Location" required>
                                <div class="icon ">
                                    <i class="icon-search"></i>
                                </div>
                            </fieldset> -->
                            <div class="widget-range mb-30">
                                <!-- <div class="box-title-price mb-10">
                                    <div class="caption-price text-12">
                                        <span>Distance:</span>
                                        <span class="value" id="slider-range-value4"></span>
                                        <span>miles</span>
                                    </div>
                                </div>
                                <div id="slider-range3"></div> -->
                                <div class="slider-labels">
                                    <div>
                                        <input type="hidden" name="min-value3" value="">
                                        <input type="hidden" name="max-value3" value="">
                                    </div>
                                </div>
                            </div>
                            <!-- <div class=" group-select mb-30">
                                <div class="box-select mb-12">
                                    <div class="nice-select" tabindex="0">
                                        <span class="current">Status</span>
                                        <ul class="list">
                                            <li data-value="1" class="option">California</li>
                                            <li data-value="2" class="option selected">Texas</li>
                                            <li data-value="3" class="option">Florida </li>
                                            <li data-value="4" class="option">New York
                                            </li>
                                            <li data-value="5" class="option">Illinois</li>
                                            <li data-value="6" class="option">Washington</li>
                                            <li data-value="7" class="option">Pennsylvania</li>
                                            <li data-value="8" class="option">Ohio</li>
                                            <li data-value="9" class="option">Georgia</li>
                                            <li data-value="10" class="option">North Carolina
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                                <div class="box-select mb-12">
                                    <div class="nice-select" tabindex="0">
                                        <span class="current">Regions</span>
                                        <ul class="list">
                                            <li data-value="1" class="option">1</li>
                                            <li data-value="2" class="option selected">2</li>
                                            <li data-value="3" class="option">3</li>
                                            <li data-value="4" class="option">4</li>
                                            <li data-value="5" class="option">5</li>
                                            <li data-value="6" class="option">6</li>
                                            <li data-value="7" class="option">7</li>
                                            <li data-value="8" class="option">8</li>
                                            <li data-value="9" class="option">9</li>
                                            <li data-value="10" class="option">10</li>
                                        </ul>
                                    </div>
                                </div>
                                <div class="box-select mb-12">
                                    <div class="nice-select" tabindex="0">
                                        <span class="current">House</span>
                                        <ul class="list">
                                            <li data-value="1" class="option">1</li>
                                            <li data-value="2" class="option selected">2</li>
                                            <li data-value="3" class="option">3</li>
                                            <li data-value="4" class="option">4</li>
                                        </ul>
                                    </div>
                                </div>
                                <div class="box-select mb-12">
                                    <div class="nice-select" tabindex="0">
                                        <span class="current">Beds</span>
                                        <ul class="list">
                                            <li data-value="1" class="option">1</li>
                                            <li data-value="2" class="option selected">2</li>
                                            <li data-value="3" class="option">3</li>
                                            <li data-value="4" class="option">4</li>
                                            <li data-value="5" class="option">5</li>
                                            <li data-value="6" class="option">6</li>
                                        </ul>
                                    </div>
                                </div>
                                <div class="box-select mb-12">
                                    <div class="nice-select" tabindex="0">
                                        <span class="current">Baths</span>
                                        <ul class="list">
                                            <li data-value="1" class="option">1</li>
                                            <li data-value="2" class="option selected">2</li>
                                            <li data-value="3" class="option">3</li>
                                            <li data-value="4" class="option">4</li>
                                            <li data-value="5" class="option">5</li>
                                            <li data-value="6" class="option">6</li>
                                        </ul>
                                    </div>
                                </div>
                                <div class="box-select mb-12">
                                    <div class="nice-select" tabindex="0">
                                        <span class="current">Garages</span>
                                        <ul class="list">
                                            <li data-value="1" class="option">1</li>
                                            <li data-value="2" class="option selected">2</li>
                                            <li data-value="3" class="option">3</li>
                                            <li data-value="4" class="option">4</li>
                                            <li data-value="5" class="option">5</li>
                                            <li data-value="6" class="option">6</li>
                                        </ul>
                                    </div>
                                </div>
                            </div> -->
                            <!-- <div class="widget-price style-2 mb-30">
                                <div class="box-title-price mb-10">
                                    <span class="title-price">Price:</span>
                                    <div class="caption-price">
                                        <span class="value" id="slider-range-value03"></span>
                                        <span>-</span>
                                        <span class="value" id="slider-range-value04"></span>
                                    </div>
                                </div>
                                <div id="slider-range4"></div>
                                <div class="slider-labels">
                                    <div>
                                        <input type="hidden" name="min-value" value="">
                                        <input type="hidden" name="max-value" value="">
                                    </div>
                                </div>
                            </div> -->



                            <div class="budget filter-category">
                                <h5>Select your Budget</h5>
                                <div class="nice-select" tabindex="0">
                                    <span class="current">Select your Budget</span>
                                    <ul class="list">
                                        <li data-value="bungalow" class="option">Under 40 lacs</li>
                                        <li data-value="apartment" class="option">40 lacs - 70 lacs</li>
                                        <li data-value="house" class="option">70 lacs - 1 Crore</li>
                                        <li data-value="house" class="option">1 Crore - 2 Crore</li>
                                        <li data-value="house" class="option">Above 2 Crore</li>
                                        <li data-value="house" class="option">On request/Coming Soon</li>

                                    </ul>
                                </div>
                                <!-- <fieldset class="checkbox-item  style-1  ">
                                    <label>
                                        <span class="text-4"></span>
                                        <input type="checkbox">
                                        <span class="btn-checkbox"></span>
                                    </label>
                                </fieldset>
                                <fieldset class="checkbox-item  style-1  ">
                                    <label>
                                        <span class="text-4">40 lacs - 70 lacs</span>
                                        <input type="checkbox">
                                        <span class="btn-checkbox"></span>
                                    </label>
                                </fieldset>
                                <fieldset class="checkbox-item  style-1  ">
                                    <label>
                                        <span class="text-4">70 lacs - 1 Crore</span>
                                        <input type="checkbox">
                                        <span class="btn-checkbox"></span>
                                    </label>
                                </fieldset>
                                <fieldset class="checkbox-item  style-1  ">
                                    <label>
                                        <span class="text-4">1 Crore - 2 Crore</span>
                                        <input type="checkbox">
                                        <span class="btn-checkbox"></span>
                                    </label>
                                </fieldset>
                                <fieldset class="checkbox-item  style-1  ">
                                    <label>
                                        <span class="text-4">Above 2 Crore</span>
                                        <input type="checkbox">
                                        <span class="btn-checkbox"></span>
                                    </label>
                                </fieldset>
                                <fieldset class="checkbox-item  style-1  ">
                                    <label>
                                        <span class="text-4">On request/Coming Soon</span>
                                        <input type="checkbox">
                                        <span class="btn-checkbox"></span>
                                    </label>
                                </fieldset> -->
                            </div>

                            <div class="unit-type filter-category">
                                <h5>Various unit types in Coimbatore</h5>

                                <div class="nice-select" tabindex="0">
                                    <span class="current">Select Unit Types</span>
                                    <ul class="list">
                                        <li data-value="bungalow" class="option">1 BHK</li>
                                        <li data-value="apartment" class="option">2 BHK</li>
                                        <li data-value="house" class="option">3 BHK</li>
                                        <li data-value="house" class="option">4 BHK</li>
                                        <li data-value="house" class="option">4+ BHK </li>
                                    </ul>
                                </div>


                                <!-- <fieldset class="checkbox-item  style-1  ">
                                    <label>
                                        <span class="text-4">1 BHK</span>
                                        <input type="checkbox">
                                        <span class="btn-checkbox"></span>
                                    </label>
                                </fieldset>
                                <fieldset class="checkbox-item  style-1  ">
                                    <label>
                                        <span class="text-4">2 BHK</span>
                                        <input type="checkbox">
                                        <span class="btn-checkbox"></span>
                                    </label>
                                </fieldset>
                                <fieldset class="checkbox-item  style-1  ">
                                    <label>
                                        <span class="text-4">3 BHK</span>
                                        <input type="checkbox">
                                        <span class="btn-checkbox"></span>
                                    </label>
                                </fieldset>
                                <fieldset class="checkbox-item  style-1  ">
                                    <label>
                                        <span class="text-4">4 BHK</span>
                                        <input type="checkbox">
                                        <span class="btn-checkbox"></span>
                                    </label>
                                </fieldset>
                                <fieldset class="checkbox-item  style-1  ">
                                    <label>
                                        <span class="text-4">4+ BHK</span>
                                        <input type="checkbox">
                                        <span class="btn-checkbox"></span>
                                    </label>
                                </fieldset> -->
                            </div>

                            <div class="purchase-type filter-category">
                                <h5>Purchase Type</h5>

                                <div class="nice-select" tabindex="0">
                                    <span class="current">Select Purchase Type</span>
                                    <ul class="list">
                                        <li data-value="bungalow" class="option">New Project</li>
                                        <li data-value="apartment" class="option">>Resale</li>
                                    </ul>
                                </div>


                                <!-- <fieldset class="checkbox-item  style-1  ">
                                    <label>
                                        <span class="text-4">New Project</span>
                                        <input type="checkbox">
                                        <span class="btn-checkbox"></span>
                                    </label>
                                </fieldset>
                                <fieldset class="checkbox-item  style-1  ">
                                    <label>
                                        <span class="text-4">Resale</span>
                                        <input type="checkbox">
                                        <span class="btn-checkbox"></span>
                                    </label>
                                </fieldset> -->
                            </div>

                            <div class="possession filter-category">
                                <h5>Possession</h5>

                                <div class="nice-select" tabindex="0">
                                    <span class="current">Select Possession</span>
                                    <ul class="list">
                                        <li data-value="bungalow" class="option">Ready to Move</li>
                                        <li data-value="apartment" class="option">In 1 Year</li>
                                        <li data-value="apartment" class="option">In 2 Years</li>
                                        <li data-value="apartment" class="option">In 3 years</li>
                                        <li data-value="apartment" class="option">After 3 Years</li>
                                    </ul>
                                </div>


                                <!-- <fieldset class="checkbox-item  style-1  ">
                                    <label>
                                        <span class="text-4">Ready to Move </span>
                                        <input type="checkbox">
                                        <span class="btn-checkbox"></span>
                                    </label>
                                </fieldset>
                                <fieldset class="checkbox-item  style-1  ">
                                    <label>
                                        <span class="text-4">In 1 Year</span>
                                        <input type="checkbox">
                                        <span class="btn-checkbox"></span>
                                    </label>
                                </fieldset>
                                <fieldset class="checkbox-item  style-1  ">
                                    <label>
                                        <span class="text-4">In 2 Years</span>
                                        <input type="checkbox">
                                        <span class="btn-checkbox"></span>
                                    </label>
                                </fieldset>
                                <fieldset class="checkbox-item  style-1  ">
                                    <label>
                                        <span class="text-4">In 3 years</span>
                                        <input type="checkbox">
                                        <span class="btn-checkbox"></span>
                                    </label>
                                </fieldset>
                                <fieldset class="checkbox-item  style-1  ">
                                    <label>
                                        <span class="text-4">After 3 Years</span>
                                        <input type="checkbox">
                                        <span class="btn-checkbox"></span>
                                    </label>
                                </fieldset> -->
                            </div>

                            <div class="listed-by filter-category">
                                <h5>Listed By </h5>

                                <div class="nice-select" tabindex="0">
                                    <span class="current">Listed By</span>
                                    <ul class="list">
                                        <li data-value="bungalow" class="option">Owner</li>
                                        <li data-value="apartment" class="option">Agent</li>
                                        <li data-value="apartment" class="option">Developers</li>
                                    </ul>
                                </div>

                                <!-- <fieldset class="checkbox-item  style-1  ">
                                    <label>
                                        <span class="text-4">Owner</span>
                                        <input type="checkbox">
                                        <span class="btn-checkbox"></span>
                                    </label>
                                </fieldset>
                                <fieldset class="checkbox-item  style-1  ">
                                    <label>
                                        <span class="text-4">Agent</span>
                                        <input type="checkbox">
                                        <span class="btn-checkbox"></span>
                                    </label>
                                </fieldset>
                                <fieldset class="checkbox-item  style-1  ">
                                    <label>
                                        <span class="text-4">Developers</span>
                                        <input type="checkbox">
                                        <span class="btn-checkbox"></span>
                                    </label>
                                </fieldset> -->
                            </div>

                            <div class="age-of-property filter-category">
                                <h5>Age of Property</h5>

                                <div class="nice-select" tabindex="0">
                                    <span class="current">Select Age of Propert</span>
                                    <ul class="list">
                                        <li data-value="bungalow" class="option">Less than a Year</li>
                                        <li data-value="apartment" class="option">Less than 2 Year</li>
                                        <li data-value="apartment" class="option">Less than 3 Years</li>
                                        <li data-value="apartment" class="option">Less than 4 Years</li>
                                    </ul>
                                </div>
                                <!-- <fieldset class="checkbox-item  style-1  ">
                                    <label>
                                        <span class="text-4">Less than a Year</span>
                                        <input type="checkbox">
                                        <span class="btn-checkbox"></span>
                                    </label>
                                </fieldset>
                                <fieldset class="checkbox-item  style-1  ">
                                    <label>
                                        <span class="text-4">Less than 2 Year</span>
                                        <input type="checkbox">
                                        <span class="btn-checkbox"></span>
                                    </label>
                                </fieldset>
                                <fieldset class="checkbox-item  style-1  ">
                                    <label>
                                        <span class="text-4">Less than 3 Years</span>
                                        <input type="checkbox">
                                        <span class="btn-checkbox"></span>
                                    </label>
                                </fieldset>
                                <fieldset class="checkbox-item  style-1  ">
                                    <label>
                                        <span class="text-4">Less than 4 Years</span>
                                        <input type="checkbox">
                                        <span class="btn-checkbox"></span>
                                    </label>
                                </fieldset> -->
                            </div>

                            <div class="amenities filter-category">
                                <h5>Amenities</h5>

                                <div class="nice-select" tabindex="0">
                                    <span class="current">Select Age of Propert</span>
                                    <ul class="list">
                                        <li data-value="bungalow" class="option">Parking</li>
                                        <li data-value="apartment" class="option">Swimming Pool</li>
                                        <li data-value="apartment" class="option">Lift</li>
                                        <li data-value="apartment" class="option">Gated Community</li>
                                        <li data-value="apartment" class="option">Gas Pipeline</li>
                                    </ul>
                                </div>


                                <!-- <fieldset class="checkbox-item  style-1  ">
                                    <label>
                                        <span class="text-4">Parking</span>
                                        <input type="checkbox">
                                        <span class="btn-checkbox"></span>
                                    </label>
                                </fieldset>
                                <fieldset class="checkbox-item  style-1  ">
                                    <label>
                                        <span class="text-4">Swimming Pool</span>
                                        <input type="checkbox">
                                        <span class="btn-checkbox"></span>
                                    </label>
                                </fieldset>
                                <fieldset class="checkbox-item  style-1  ">
                                    <label>
                                        <span class="text-4">Lift</span>
                                        <input type="checkbox">
                                        <span class="btn-checkbox"></span>
                                    </label>
                                </fieldset>
                                <fieldset class="checkbox-item  style-1  ">
                                    <label>
                                        <span class="text-4">Gated Community</span>
                                        <input type="checkbox">
                                        <span class="btn-checkbox"></span>
                                    </label>
                                </fieldset>
                                <fieldset class="checkbox-item  style-1  ">
                                    <label>
                                        <span class="text-4">Gas Pipeline</span>
                                        <input type="checkbox">
                                        <span class="btn-checkbox"></span>
                                    </label>
                                </fieldset> -->
                            </div>



                            <button type="submit" class="tf-btn bg-color-primary w-full">
                                Search Property<i class="icon-search"></i>
                            </button>
                        </form>
                        <!-- <div class="sidebar-item sidebar-featured style-2  pb-36 mb-28">
                            <h4 class="sidebar-title mb-28 ">Featured Listings</h4>
                            <ul>
                                <li class="box-listings style-2 hover-img">
                                    <div class="image-wrap">
                                        <img class="lazyload" data-src="/assets/images/section/box-listing-1.jpg"
                                            src="/assets/images/section/box-listing-1.jpg" alt="">
                                    </div>
                                    <div class="content">
                                        <div class="text-1 title fw-5 lh-20">
                                            <a href="#">Casa Lomas de Machalí Machas</a>
                                        </div>
                                        <ul class="meta-list flex">
                                            <li class="text-1 flex"><span>3</span>Bed</li>
                                            <li class="text-1 flex"><span>3</span>Bath</li>
                                            <li class="text-1 flex"><span>4,043</span>Sqft</li>
                                        </ul>
                                        <div class="price text-1 lh-20 fw-6">$7250,00</div>
                                    </div>
                                </li>
                                <li class="box-listings style-2 hover-img">
                                    <div class=" image-wrap">
                                        <img class="lazyload" data-src="/assets/images/section/box-listing-2.jpg"
                                            src="/assets/images/section/box-listing-2.jpg" alt="">
                                    </div>
                                    <div class="content">
                                        <div class="text-1 title fw-5 lh-20">
                                            <a href="#">Casa Lomas de Machalí Machas</a>
                                        </div>
                                        <ul class="meta-list flex">
                                            <li class="text-1 flex"><span>3</span>Bed</li>
                                            <li class="text-1 flex"><span>3</span>Bath</li>
                                            <li class="text-1 flex"><span>4,043</span>Sqft</li>
                                        </ul>
                                        <div class="price text-1 lh-20 fw-6">$7250,00</div>

                                    </div>
                                </li>
                                <li class="box-listings style-2 hover-img">
                                    <div class=" image-wrap">
                                        <img class="lazyload" data-src="/assets/images/section/box-listing-3.jpg"
                                            src="/assets/images/section/box-listing-3.jpg" alt="">
                                    </div>
                                    <div class="content">
                                        <div class="text-1 title fw-5 lh-20">
                                            <a href="#">Casa Lomas de Machalí Machas</a>
                                        </div>
                                        <ul class="meta-list flex">
                                            <li class="text-1 flex"><span>3</span>Bed</li>
                                            <li class="text-1 flex"><span>3</span>Bath</li>
                                            <li class="text-1 flex"><span>4,043</span>Sqft</li>
                                        </ul>
                                        <div class="price text-1 lh-20 fw-6">$7250,00</div>

                                    </div>
                                </li>
                                <li class="box-listings style-2 hover-img">
                                    <div class=" image-wrap">
                                        <img class="lazyload" data-src="/assets/images/section/box-listing-4.jpg"
                                            src="/assets/images/section/box-listing-4.jpg" alt="">
                                    </div>
                                    <div class="content">
                                        <div class="text-1 title fw-5 lh-20">
                                            <a href="#">Casa Lomas de Machalí Machas</a>
                                        </div>
                                        <ul class="meta-list flex">
                                            <li class="text-1 flex"><span>3</span>Bed</li>
                                            <li class="text-1 flex"><span>3</span>Bath</li>
                                            <li class="text-1 flex"><span>4,043</span>Sqft</li>
                                        </ul>
                                        <div class="price text-1 lh-20 fw-6">$7250,00</div>
                                    </div>
                                </li>
                                <li class="box-listings style-2 hover-img">
                                    <div class=" image-wrap">
                                        <img class="lazyload" data-src="/assets/images/section/box-listing-5.jpg"
                                            src="/assets/images/section/box-listing-5.jpg" alt="">
                                    </div>
                                    <div class="content">
                                        <div class="text-1 title fw-5 lh-20">
                                            <a href="#">Casa Lomas de Machalí Machas</a>
                                        </div>
                                        <ul class="meta-list flex">
                                            <li class="text-1 flex"><span>3</span>Bed</li>
                                            <li class="text-1 flex"><span>3</span>Bath</li>
                                            <li class="text-1 flex"><span>4,043</span>Sqft</li>
                                        </ul>
                                        <div class="price text-1 lh-20 fw-6">$7250,00</div>

                                    </div>
                                </li>
                            </ul>
                        </div>
                        <div class="sidebar-item sidebar-location">
                            <h4 class="sidebar-title mb-28 ">Real estate near you</h4>
                            <div class="wrap-box-location">
                                <a class="box-location style-2 hover-img-rotate">
                                    <div class="image-wrap">
                                        <img class="lazyload" data-src="/assets/images/section/location-23.jpg"
                                            src="/assets/images/section/location-23.jpg" alt="">
                                    </div>
                                    <div class="content">
                                        <h6 class="text-white text-1 lh-20">New York</h6>
                                        <p class="text-2">1570 listing</p>
                                    </div>
                                </a>
                                <a class="box-location style-2 hover-img-rotate">
                                    <div class="image-wrap">
                                        <img class="lazyload" data-src="/assets/images/section/location-24.jpg"
                                            src="/assets/images/section/location-24.jpg" alt="">
                                    </div>
                                    <div class="content">
                                        <h6 class="text-white text-1 lh-20">Mississauga</h6>
                                        <p class="text-2">1570 listing</p>
                                    </div>
                                </a>
                                <a class="box-location style-2 hover-img-rotate">
                                    <div class="image-wrap">
                                        <img class="lazyload" data-src="/assets/images/section/location-25.jpg"
                                            src="/assets/images/section/location-25.jpg" alt="">
                                    </div>
                                    <div class="content">
                                        <h6 class="text-white text-1 lh-20">Halifax</h6>
                                        <p class="text-2">1570 listing</p>
                                    </div>
                                </a>
                                <a class="box-location style-2 hover-img-rotate">
                                    <div class="image-wrap">
                                        <img class="lazyload" data-src="/assets/images/section/location-26.jpg"
                                            src="/assets/images/section/location-26.jpg" alt="">
                                    </div>
                                    <div class="content">
                                        <h6 class="text-white text-1 lh-20">Ottawa</h6>
                                        <p class="text-2">1570 listing</p>
                                    </div>
                                </a>
                                <a class="box-location style-2 hover-img-rotate">
                                    <div class="image-wrap">
                                        <img class="lazyload" data-src="/assets/images/section/location-27.jpg"
                                            src="/assets/images/section/location-27.jpg" alt="">
                                    </div>
                                    <div class="content">
                                        <h6 class="text-white text-1 lh-20">Iqaluit</h6>
                                        <p class="text-2">1570 listing</p>
                                    </div>
                                </a>
                                <a class="box-location style-2 hover-img-rotate">
                                    <div class="image-wrap">
                                        <img class="lazyload" data-src="/assets/images/section/location-28.jpg"
                                            src="/assets/images/section/location-28.jpg" alt="">
                                    </div>
                                    <div class="content">
                                        <h6 class="text-white text-1 lh-20">Toronto</h6>
                                        <p class="text-2">1570 listing</p>
                                    </div>
                                </a>
                            </div>
                        </div>
                        <div class="sidebar-item sidebar-contact-agents">
                            <h4 class="sidebar-title mb-28 ">Real estate near you</h4>
                            <div class="wrap-contact-agents">
                                <div class="box-contact-agent">
                                    <div class="avatar">
                                        <img src="/assets/images/avatar/avt-png19.png" alt="">
                                    </div>
                                    <div class="content">
                                        <a href="#" class="text-1">Robert Fox</a>
                                        <h6>(201) 555-0124</h6>
                                    </div>
                                </div>
                                <div class="box-contact-agent">
                                    <div class="avatar">
                                        <img src="/assets/images/avatar/avt-png20.png" alt="">
                                    </div>
                                    <div class="content">
                                        <a href="#" class="text-1">Cameron Williamson</a>
                                        <h6>(405) 555-0128</h6>
                                    </div>
                                </div>
                                <div class="box-contact-agent">
                                    <div class="avatar">
                                        <img src="/assets/images/avatar/avt-png21.png" alt="">
                                    </div>
                                    <div class="content">
                                        <a href="#" class="text-1">Darlene Robertson</a>
                                        <h6>(252) 555-0126</h6>
                                    </div>
                                </div>
                            </div>
                        </div> -->
                        <!-- <div class="sidebar-ads">
                            <div class="image-wrap">
                                <img class="lazyload" data-src="/assets/images/blog/ads.jpg" src="/assets/images/blog/ads.jpg" alt="">
                            </div>
                            <div class="logo relative z-5">
                                <img src="/assets/images/logo/logo-2%402x.png" alt="">
                            </div>
                            <div class="box-ads relative z-5">
                                <div class="content ">
                                    <h4 class="title"><a href="#">We can help you find a
                                            local real estate agent</a> </h4>
                                    <div class="text-addres ">
                                        <p>Connect with a trusted agent who knows the market inside out -
                                            whether you’re buying or selling.</p>
                                    </div>
                                </div>
                                <a href="#" class="tf-btn fw-6 bg-color-primary w-full">
                                    Connect with an agent
                                </a>
                            </div>
                        </div> -->
                    </div>
                </div>
                <div class="col-lg-8">
                    <div class="flat-animate-tab">
                        <div class="tab-content">
                            <div class="tab-pane active show" id="listLayout" role="tabpanel">
                                <div class="wrap-list">
                                    <!-- <div class="box-house style-list hover-img">
                                        <div class="image-wrap">
                                            <a href="#">
                                                <img class="lazyload" data-src="/assets/images/section/box-house.jpg"
                                                    src="/assets/images/section/box-house.jpg" alt="">
                                            </a>
                                            <ul class="box-tag flex gap-8 ">
                                                <li class="flat-tag text-4 bg-main fw-6 text-white">Featured
                                                </li>
                                                <li class="flat-tag text-4 bg-3 fw-6 text-white">For Sale</li>
                                            </ul>
                                            <div class="list-btn flex gap-8 ">
                                                <a href="#" class="btn-icon save hover-tooltip"><i
                                                        class="icon-save"></i>
                                                    <span class="tooltip">Add Favorite</span>
                                                </a>
                                                <a href="#" class="btn-icon find hover-tooltip"><i
                                                        class="icon-find-plus"></i>
                                                    <span class="tooltip">Quick View</span>
                                                </a>
                                            </div>
                                        </div>
                                        <div class="content">
                                            <h5 class="title">
                                                <a href="#">Singanallur</a>

                                            </h5>
                                            <p class="location text-1 flex items-center gap-6">
                                                <i class="icon-location"></i>Flat for Sale in Singanallur, Coimbatore
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
                                    </div> -->
                                    <!-- <div class="box-house style-list hover-img">
                                        <div class="image-wrap">
                                            <a href="#">
                                                <img class="lazyload" data-src="/assets/images/section/box-house-2.jpg"
                                                    src="/assets/images/section/box-house-2.jpg" alt="">
                                            </a>
                                            <ul class="box-tag flex gap-8 ">
                                                <li class="flat-tag text-4 bg-main fw-6 text-white">Featured
                                                </li>
                                                <li class="flat-tag text-4 bg-3 fw-6 text-white">For Sale</li>
                                            </ul>
                                            <div class="list-btn flex gap-8 ">
                                                <a href="#" class="btn-icon save hover-tooltip"><i
                                                        class="icon-save"></i>
                                                    <span class="tooltip">Add Favorite</span>
                                                </a>
                                                <a href="#" class="btn-icon find hover-tooltip"><i
                                                        class="icon-find-plus"></i>
                                                    <span class="tooltip">Quick View</span>
                                                </a>
                                            </div>
                                        </div>
                                        <div class="content">
                                            <h5 class="title">
                                                <a href="#">KRG Nagar</a>

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

                                                    <a href="#" class="tf-btn style-border pd-4">Details</a>
                                                </div>
                                            </div>
                                        </div>
                                    </div> -->
                                    <!-- <div class="box-house style-list hover-img">
                                        <div class="image-wrap">
                                            <a href="#">
                                                <img class="lazyload" data-src="/assets/images/section/box-house-3.jpg"
                                                    src="/assets/images/section/box-house-3.jpg" alt="">
                                            </a>
                                            <ul class="box-tag flex gap-8 ">
                                                <li class="flat-tag text-4 bg-main fw-6 text-white">Featured
                                                </li>
                                                <li class="flat-tag text-4 bg-3 fw-6 text-white">For Sale</li>
                                            </ul>
                                            <div class="list-btn flex gap-8 ">
                                                <a href="#" class="btn-icon save hover-tooltip"><i
                                                        class="icon-save"></i>
                                                    <span class="tooltip">Add Favorite</span>
                                                </a>
                                                <a href="#" class="btn-icon find hover-tooltip"><i
                                                        class="icon-find-plus"></i>
                                                    <span class="tooltip">Quick View</span>
                                                </a>
                                            </div>
                                        </div>
                                        <div class="content">
                                            <h5 class="title">
                                                <a href="#">Elegant studio flat</a>

                                            </h5>
                                            <p class="location text-1 flex items-center gap-6">
                                                <i class="icon-location"></i> Los Angeles, California 91604
                                            </p>
                                            <ul class="meta-list flex">
                                                <li class="text-1 flex"><span>3</span>Beds</li>
                                                <li class="text-1 flex"><span>3</span>Baths</li>
                                                <li class="text-1 flex"><span>4,043</span>Sqft</li>
                                            </ul>
                                            <div class="bot flex justify-between items-center">
                                                <h5 class="price">
                                                    $8.600
                                                </h5>
                                                <div class="wrap-btn flex">

                                                    <a href="#"
                                                        class="tf-btn style-border pd-4">Details</a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="box-house style-list hover-img">
                                        <div class="image-wrap">
                                            <a href="#">
                                                <img class="lazyload" data-src="/assets/images/section/box-house-4.jpg"
                                                    src="/assets/images/section/box-house-4.jpg" alt="">
                                            </a>
                                            <ul class="box-tag flex gap-8 ">
                                                <li class="flat-tag text-4 bg-main fw-6 text-white">Featured
                                                </li>
                                                <li class="flat-tag text-4 bg-3 fw-6 text-white">For Sale</li>
                                            </ul>
                                            <div class="list-btn flex gap-8 ">
                                                <a href="#" class="btn-icon save hover-tooltip"><i
                                                        class="icon-save"></i>
                                                    <span class="tooltip">Add Favorite</span>
                                                </a>
                                                <a href="#" class="btn-icon find hover-tooltip"><i
                                                        class="icon-find-plus"></i>
                                                    <span class="tooltip">Quick View</span>
                                                </a>
                                            </div>
                                        </div>
                                        <div class="content">
                                            <h5 class="title">
                                                <a href="#">Elegant studio flat</a>

                                            </h5>
                                            <p class="location text-1 flex items-center gap-6">
                                                <i class="icon-location"></i> Los Angeles, California 91604
                                            </p>
                                            <ul class="meta-list flex">
                                                <li class="text-1 flex"><span>3</span>Beds</li>
                                                <li class="text-1 flex"><span>3</span>Baths</li>
                                                <li class="text-1 flex"><span>4,043</span>Sqft</li>
                                            </ul>
                                            <div class="bot flex justify-between items-center">
                                                <h5 class="price">
                                                    $8.600
                                                </h5>
                                                <div class="wrap-btn flex">

                                                    <a href="#"
                                                        class="tf-btn style-border pd-4">Details</a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="box-house style-list hover-img">
                                        <div class="image-wrap">
                                            <a href="#">
                                                <img class="lazyload" data-src="/assets/images/section/box-house-5.jpg"
                                                    src="/assets/images/section/box-house-5.jpg" alt="">
                                            </a>
                                            <ul class="box-tag flex gap-8 ">
                                                <li class="flat-tag text-4 bg-main fw-6 text-white">Featured
                                                </li>
                                                <li class="flat-tag text-4 bg-3 fw-6 text-white">For Sale</li>
                                            </ul>
                                            <div class="list-btn flex gap-8 ">
                                                <a href="#" class="btn-icon save hover-tooltip"><i
                                                        class="icon-save"></i>
                                                    <span class="tooltip">Add Favorite</span>
                                                </a>
                                                <a href="#" class="btn-icon find hover-tooltip"><i
                                                        class="icon-find-plus"></i>
                                                    <span class="tooltip">Quick View</span>
                                                </a>
                                            </div>
                                        </div>
                                        <div class="content">
                                            <h5 class="title">
                                                <a href="#">Elegant studio flat</a>

                                            </h5>
                                            <p class="location text-1 flex items-center gap-6">
                                                <i class="icon-location"></i> Los Angeles, California 91604
                                            </p>
                                            <ul class="meta-list flex">
                                                <li class="text-1 flex"><span>3</span>Beds</li>
                                                <li class="text-1 flex"><span>3</span>Baths</li>
                                                <li class="text-1 flex"><span>4,043</span>Sqft</li>
                                            </ul>
                                            <div class="bot flex justify-between items-center">
                                                <h5 class="price">
                                                    $8.600
                                                </h5>
                                                <div class="wrap-btn flex">

                                                    <a href="#"
                                                        class="tf-btn style-border pd-4">Details</a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="box-house style-list hover-img">
                                        <div class="image-wrap">
                                            <a href="#">
                                                <img class="lazyload" data-src="/assets/images/section/box-house-6.jpg"
                                                    src="/assets/images/section/box-house-6.jpg" alt="">
                                            </a>
                                            <ul class="box-tag flex gap-8 ">
                                                <li class="flat-tag text-4 bg-main fw-6 text-white">Featured
                                                </li>
                                                <li class="flat-tag text-4 bg-3 fw-6 text-white">For Sale</li>
                                            </ul>
                                            <div class="list-btn flex gap-8 ">
                                                <a href="#" class="btn-icon save hover-tooltip"><i
                                                        class="icon-save"></i>
                                                    <span class="tooltip">Add Favorite</span>
                                                </a>
                                                <a href="#" class="btn-icon find hover-tooltip"><i
                                                        class="icon-find-plus"></i>
                                                    <span class="tooltip">Quick View</span>
                                                </a>
                                            </div>
                                        </div>
                                        <div class="content">
                                            <h5 class="title">
                                                <a href="#">Elegant studio flat</a>

                                            </h5>
                                            <p class="location text-1 flex items-center gap-6">
                                                <i class="icon-location"></i> Los Angeles, California 91604
                                            </p>
                                            <ul class="meta-list flex">
                                                <li class="text-1 flex"><span>3</span>Beds</li>
                                                <li class="text-1 flex"><span>3</span>Baths</li>
                                                <li class="text-1 flex"><span>4,043</span>Sqft</li>
                                            </ul>
                                            <div class="bot flex justify-between items-center">
                                                <h5 class="price">
                                                    $8.600
                                                </h5>
                                                <div class="wrap-btn flex">

                                                    <a href="#"
                                                        class="tf-btn style-border pd-4">Details</a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="box-house style-list hover-img">
                                        <div class="image-wrap">
                                            <a href="#">
                                                <img class="lazyload" data-src="/assets/images/section/box-house-7.jpg"
                                                    src="/assets/images/section/box-house-7.jpg" alt="">
                                            </a>
                                            <ul class="box-tag flex gap-8 ">
                                                <li class="flat-tag text-4 bg-main fw-6 text-white">Featured
                                                </li>
                                                <li class="flat-tag text-4 bg-3 fw-6 text-white">For Sale</li>
                                            </ul>
                                            <div class="list-btn flex gap-8 ">
                                                <a href="#" class="btn-icon save hover-tooltip"><i
                                                        class="icon-save"></i>
                                                    <span class="tooltip">Add Favorite</span>
                                                </a>
                                                <a href="#" class="btn-icon find hover-tooltip"><i
                                                        class="icon-find-plus"></i>
                                                    <span class="tooltip">Quick View</span>
                                                </a>
                                            </div>
                                        </div>
                                        <div class="content">
                                            <h5 class="title">
                                                <a href="#">Elegant studio flat</a>

                                            </h5>
                                            <p class="location text-1 flex items-center gap-6">
                                                <i class="icon-location"></i> Los Angeles, California 91604
                                            </p>
                                            <ul class="meta-list flex">
                                                <li class="text-1 flex"><span>3</span>Beds</li>
                                                <li class="text-1 flex"><span>3</span>Baths</li>
                                                <li class="text-1 flex"><span>4,043</span>Sqft</li>
                                            </ul>
                                            <div class="bot flex justify-between items-center">
                                                <h5 class="price">
                                                    $8.600
                                                </h5>
                                                <div class="wrap-btn flex">

                                                    <a href="#"
                                                        class="tf-btn style-border pd-4">Details</a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="box-house style-list hover-img">
                                        <div class="image-wrap">
                                            <a href="#">
                                                <img class="lazyload" data-src="/assets/images/section/box-house-8.jpg"
                                                    src="/assets/images/section/box-house-8.jpg" alt="">
                                            </a>
                                            <ul class="box-tag flex gap-8 ">
                                                <li class="flat-tag text-4 bg-main fw-6 text-white">Featured
                                                </li>
                                                <li class="flat-tag text-4 bg-3 fw-6 text-white">For Sale</li>
                                            </ul>
                                            <div class="list-btn flex gap-8 ">
                                                <a href="#" class="btn-icon save hover-tooltip"><i
                                                        class="icon-save"></i>
                                                    <span class="tooltip">Add Favorite</span>
                                                </a>
                                                <a href="#" class="btn-icon find hover-tooltip"><i
                                                        class="icon-find-plus"></i>
                                                    <span class="tooltip">Quick View</span>
                                                </a>
                                            </div>
                                        </div>
                                        <div class="content">
                                            <h5 class="title">
                                                <a href="#">Elegant studio flat</a>

                                            </h5>
                                            <p class="location text-1 flex items-center gap-6">
                                                <i class="icon-location"></i> Los Angeles, California 91604
                                            </p>
                                            <ul class="meta-list flex">
                                                <li class="text-1 flex"><span>3</span>Beds</li>
                                                <li class="text-1 flex"><span>3</span>Baths</li>
                                                <li class="text-1 flex"><span>4,043</span>Sqft</li>
                                            </ul>
                                            <div class="bot flex justify-between items-center">
                                                <h5 class="price">
                                                    $8.600
                                                </h5>
                                                <div class="wrap-btn flex">

                                                    <a href="#"
                                                        class="tf-btn style-border pd-4">Details</a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="box-house style-list hover-img">
                                        <div class="image-wrap">
                                            <a href="#">
                                                <img class="lazyload" data-src="/assets/images/section/box-house-9.jpg"
                                                    src="/assets/images/section/box-house-9.jpg" alt="">
                                            </a>
                                            <ul class="box-tag flex gap-8 ">
                                                <li class="flat-tag text-4 bg-main fw-6 text-white">Featured
                                                </li>
                                                <li class="flat-tag text-4 bg-3 fw-6 text-white">For Sale</li>
                                            </ul>
                                            <div class="list-btn flex gap-8 ">
                                                <a href="#" class="btn-icon save hover-tooltip"><i
                                                        class="icon-save"></i>
                                                    <span class="tooltip">Add Favorite</span>
                                                </a>
                                                <a href="#" class="btn-icon find hover-tooltip"><i
                                                        class="icon-find-plus"></i>
                                                    <span class="tooltip">Quick View</span>
                                                </a>
                                            </div>
                                        </div>
                                        <div class="content">
                                            <h5 class="title">
                                                <a href="#">Elegant studio flat</a>

                                            </h5>
                                            <p class="location text-1 flex items-center gap-6">
                                                <i class="icon-location"></i> Los Angeles, California 91604
                                            </p>
                                            <ul class="meta-list flex">
                                                <li class="text-1 flex"><span>3</span>Beds</li>
                                                <li class="text-1 flex"><span>3</span>Baths</li>
                                                <li class="text-1 flex"><span>4,043</span>Sqft</li>
                                            </ul>
                                            <div class="bot flex justify-between items-center">
                                                <h5 class="price">
                                                    $8.600
                                                </h5>
                                                <div class="wrap-btn flex">

                                                    <a href="#"
                                                        class="tf-btn style-border pd-4">Details</a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="box-house style-list hover-img">
                                        <div class="image-wrap">
                                            <a href="#">
                                                <img class="lazyload" data-src="/assets/images/section/box-house-15.jpg"
                                                    src="/assets/images/section/box-house-15.jpg" alt="">
                                            </a>
                                            <ul class="box-tag flex gap-8 ">
                                                <li class="flat-tag text-4 bg-main fw-6 text-white">Featured
                                                </li>
                                                <li class="flat-tag text-4 bg-3 fw-6 text-white">For Sale</li>
                                            </ul>
                                            <div class="list-btn flex gap-8 ">
                                                <a href="#" class="btn-icon save hover-tooltip"><i
                                                        class="icon-save"></i>
                                                    <span class="tooltip">Add Favorite</span>
                                                </a>
                                                <a href="#" class="btn-icon find hover-tooltip"><i
                                                        class="icon-find-plus"></i>
                                                    <span class="tooltip">Quick View</span>
                                                </a>
                                            </div>
                                        </div>
                                        <div class="content">
                                            <h5 class="title">
                                                <a href="#">Elegant studio flat</a>

                                            </h5>
                                            <p class="location text-1 flex items-center gap-6">
                                                <i class="icon-location"></i> Los Angeles, California 91604
                                            </p>
                                            <ul class="meta-list flex">
                                                <li class="text-1 flex"><span>3</span>Beds</li>
                                                <li class="text-1 flex"><span>3</span>Baths</li>
                                                <li class="text-1 flex"><span>4,043</span>Sqft</li>
                                            </ul>
                                            <div class="bot flex justify-between items-center">
                                                <h5 class="price">
                                                    $8.600
                                                </h5>
                                                <div class="wrap-btn flex">

                                                    <a href="#"
                                                        class="tf-btn style-border pd-4">Details</a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="box-house style-list hover-img">
                                        <div class="image-wrap">
                                            <a href="#">
                                                <img class="lazyload" data-src="/assets/images/section/box-house-16.jpg"
                                                    src="/assets/images/section/box-house-16.jpg" alt="">
                                            </a>
                                            <ul class="box-tag flex gap-8 ">
                                                <li class="flat-tag text-4 bg-main fw-6 text-white">Featured
                                                </li>
                                                <li class="flat-tag text-4 bg-3 fw-6 text-white">For Sale</li>
                                            </ul>
                                            <div class="list-btn flex gap-8 ">
                                                <a href="#" class="btn-icon save hover-tooltip"><i
                                                        class="icon-save"></i>
                                                    <span class="tooltip">Add Favorite</span>
                                                </a>
                                                <a href="#" class="btn-icon find hover-tooltip"><i
                                                        class="icon-find-plus"></i>
                                                    <span class="tooltip">Quick View</span>
                                                </a>
                                            </div>
                                        </div>
                                        <div class="content">
                                            <h5 class="title">
                                                <a href="#">Elegant studio flat</a>

                                            </h5>
                                            <p class="location text-1 flex items-center gap-6">
                                                <i class="icon-location"></i> Los Angeles, California 91604
                                            </p>
                                            <ul class="meta-list flex">
                                                <li class="text-1 flex"><span>3</span>Beds</li>
                                                <li class="text-1 flex"><span>3</span>Baths</li>
                                                <li class="text-1 flex"><span>4,043</span>Sqft</li>
                                            </ul>
                                            <div class="bot flex justify-between items-center">
                                                <h5 class="price">
                                                    $8.600
                                                </h5>
                                                <div class="wrap-btn flex">

                                                    <a href="#"
                                                        class="tf-btn style-border pd-4">Details</a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="box-house style-list hover-img">
                                        <div class="image-wrap">
                                            <a href="#">
                                                <img class="lazyload" data-src="/assets/images/section/box-house-14.jpg"
                                                    src="/assets/images/section/box-house-14.jpg" alt="">
                                            </a>
                                            <ul class="box-tag flex gap-8 ">
                                                <li class="flat-tag text-4 bg-main fw-6 text-white">Featured
                                                </li>
                                                <li class="flat-tag text-4 bg-3 fw-6 text-white">For Sale</li>
                                            </ul>
                                            <div class="list-btn flex gap-8 ">
                                                <a href="#" class="btn-icon save hover-tooltip"><i
                                                        class="icon-save"></i>
                                                    <span class="tooltip">Add Favorite</span>
                                                </a>
                                                <a href="#" class="btn-icon find hover-tooltip"><i
                                                        class="icon-find-plus"></i>
                                                    <span class="tooltip">Quick View</span>
                                                </a>
                                            </div>
                                        </div>
                                        <div class="content">
                                            <h5 class="title">
                                                <a href="#">Elegant studio flat</a>

                                            </h5>
                                            <p class="location text-1 flex items-center gap-6">
                                                <i class="icon-location"></i> Los Angeles, California 91604
                                            </p>
                                            <ul class="meta-list flex">
                                                <li class="text-1 flex"><span>3</span>Beds</li>
                                                <li class="text-1 flex"><span>3</span>Baths</li>
                                                <li class="text-1 flex"><span>4,043</span>Sqft</li>
                                            </ul>
                                            <div class="bot flex justify-between items-center">
                                                <h5 class="price">
                                                    $8.600
                                                </h5>
                                                <div class="wrap-btn flex">

                                                    <a href="#"
                                                        class="tf-btn style-border pd-4">Details</a>
                                                </div>
                                            </div>
                                        </div>
                                    </div> -->
                                </div>

                                <div class="tf-grid-layout md-col-2">
                                    <!-- <div class="box-house hover-img">
                                        <div class="image-wrap">
                                            <a href="/Apartment/singanallur">
                                                <img class="lazyload"
                                                    data-src="/assets/images/section/box-house.jpg"
                                                    src="/assets/images/section/box-house.jpg"
                                                    alt="">
                                            </a>
                                            <ul class="box-tag flex gap-8 ">
                                                <li class="flat-tag text-4 bg-main fw-6 text-white">07/01/25
                                                </li>
                                            </ul>
                                        </div>
                                        <div class="content">
                                            <h5 class="title">
                                                <a href="/Apartment/singanallur">Singanallur</a>

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
                                                    <p class="h5 lh-30 fw-4 text-color-default">10,00,000/Per Sqft</p>
                                                </h5>
                                                <div class="wrap-btn flex">
                                                    <a href="/Apartment/singanallur"
                                                        class="tf-btn style-border pd-4">Details</a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                   -->

                                </div>


                            </div>
                        </div>
                    </div>
                    <!-- <div class="wrap-pagination">
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
                    </div> -->
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
</div>
<!-- /main-content -->`;

export function LaxuryView(): React.JSX.Element {
  return <LegacyHtmlFragment html={html} />;
}
