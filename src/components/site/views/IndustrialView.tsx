import { LegacyHtmlFragment } from "@/components/site/layout/legacy-html-fragment";

const html = `<style>

.nice-select .list {
    max-height: 173px;
    overflow-y: auto;
    position: relative;
}

.nice-select .input-wrapper {
    position: sticky;
    top: 0;
    background: #fff;
    z-index: 10;
    padding: 8px;
    border-bottom: 1px solid #ddd;
}

.form-advanced-search {
    padding: 0 30px 30px 30px; 
    border-radius: 16px;
    border: 1px solid rgb(236, 236, 236);
    background-color: var(--White);
    overflow-y: scroll;
    max-height: 500px;
    position: relative;
}

.heading-title {
    position: sticky;
    top: 0;
    background-color: #fff; 
    z-index: 10;
    padding: 20px 0 20px 0;
    border-bottom: 1px solid #eee;
    margin-bottom: 20px;
}
    .flat-account1 {
        padding-top: 50px !important;
        padding-bottom: 0px !important;
    }

    .icons img {
        width: 30px !important;
        height: 30px !important;
    }

    .modal .title-box1 {
        margin-bottom: 0px;
        display: -webkit-box;
        display: -moz-box;
        display: -ms-flexbox;
        display: -webkit-flex;
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: 30px;
        padding: 0px 20px;
    }
</style>

<style>
    @media (max-width: 767px) {

        .resetbtn1 {
        padding: 14px 15px !important;
        padding-bottom: 16px !important;
        border-radius: 5px;
        background-color: #27427F !important;
        color: #fff !important;
        display: block !important;
        margin-left: 8px;
        }
        .resetbtn{
            display: none;
        }

    }
    
    .resetbtn {
        padding: 14px 15px !important;
        padding-bottom: 16px !important;
        border-radius: 5px;
        margin-left: 7px;
        background-color: #27427F !important;
        color: #fff !important;
    }
    .resetbtn1{
        display: none;
    }

    .resetbtn:hover {
        background-color: #fff !important;
        color: #27427F !important;
    }
    .rest-sidebar{
        padding:8px 15px 8px !important;
        border-radius: 4px;
    }
    .rest-sidebar:hover{
        padding:6px 15px 6px !important;
        border:1px solid #27427F;
    }

    .input-wrapper {
        width: 100%;
        margin-left: 0px;
        margin-top: 5px;
    }

    .input-wrapper input {
        border-radius: 5px !important;
        height: 40px !important;
    }

    .input-wrapper input::placeholder {
        font-size: 12px !important;
    }
    
    /* search and soryby css */

    .sortby-col-ul {
        display: flex;
        justify-content: space-between;
    }

    .sortby-col ul li .property-name-search {
        min-width: 500px;
        height: 45px;
        border: 1px solid #27427F;
        padding-left: 25px;
        border-radius: 30px;
    }

    .property-name-search:focus {
        outline: none;
        border: 2px solid #27427F !important;
    }

    .property-name-search::placeholder {
        padding-left: 10px;
        text-transform: capitalize;
        color: var(--Text);
    }

    .sortby-col ul .sortby {
        padding-left: 0px;
    }

    .sortby-col ul .sortby button {
        padding: 11px 17px;
        background-color: #fff;
        color: #27427F;
        font-weight: 600;
        font-size: 14px;
        border: 1px solid #27427F;
    }

    .sortby-col ul .sortby button:hover {
        background-color: #27427F;
        color: #fff;
    }

    .dropdown-menu {
        --bs-dropdown-min-width: 20rem !important;
        padding: 10px 5px;
    }

    .dropdown-item {
        font-size: 14px;
        padding-bottom: 6px;
        padding-top: 6px;
    }

    .dropdown-item:hover {
        color: #fff;
        background-color: #27427F;
    }

    .dropdown-toggle::after {
        display: none !important;
    }

    .btn-check:checked+.btn,
    .btn.active,
    .btn.show,
    .btn:first-child:active,
    :not(.btn-check)+.btn:active {
        color: #fff !important;
        background-color: #27427F !important;
        border-color: #27427F !important;
    }

    @media (max-width: 767px) {

        .sortby-col ul li .property-name-search {
            min-width: 100px;
            height: 45px;
            border: 1px solid #27427F;
            padding-left: 10px;
            border-radius: 30px;
            margin-top: 30px;
        }

        .sortby-col ul .sortby button {
            padding: 6px;
            background-color: #27427F;
            color: #fff;
            font-weight: 600;
            font-size: 14px;
            border: 1px solid #27427F;
            margin-top: 35px;
        }

        .property-name-search::placeholder {
            padding-left: 10px;
            text-transform: capitalize;
            color: var(--Text);
            font-size: 9px;
        }
    }
</style>


<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
<script>
    $(document).ready(function() {
        // $("#listingTypeDropdown .option").click(function() {
        //     var selectedValue = $(this).data("value");
        //     $("#listingTypeDropdown .current").text($(this).text()); // Update displayed text
        //     updatePriceRanges(selectedValue);
        // });
        
                $('input[name="listingType"]').change(function() {
    var selectedValue = $(this).val(); 
    updatePriceRanges(selectedValue);
 
});
    });

    function updatePriceRanges(value) {
        console.log("Selected Listing Type:", value);

        let priceRanges = [];

        if (value === "Sell") {
            priceRanges = [{
                    value: "15L-25L",
                    text: "15L to 25L"
                },
                {
                    value: "25L-50L",
                    text: "25L to 50L"
                },
                {
                    value: "50L-75L",
                    text: "50L to 75L"
                },
                {
                    value: "75L-1.25C",
                    text: "75L to 1.25C"
                },
                {
                    value: "1.25C-2.25C",
                    text: "1.25C to 2.25C"
                },
                {
                    value: "2.2C-3.5C",
                    text: "2.25C to 3.5C"
                },
                {
                    value: "3.5C-5C",
                    text: "3.5C to 5C"
                },
                {
                    value: "5C",
                    text: "5C & Above"
                }
            ];
        } else if (value === "Rent") {
            priceRanges = [{
                    value: "30k-50k",
                    text: "30k to 50k"
                },
                {
                    value: "50k-75k",
                    text: "50k to 75k"
                },
                {
                    value: "75k-1L",
                    text: "75k to 1L"
                },
                {
                    value: "1L-1.25L",
                    text: "1L to 1.25L"
                },
                {
                    value: "1.25L-1.5L",
                    text: "1.25L to 1.5L"
                },
                {
                    value: "1.5L-2L",
                    text: "1.5L to 2L"
                },
                {
                    value: "2L-2.75L",
                    text: "2L to 2.75L"
                },
                {
                    value: "2.75L-3.5L",
                    text: "2.75L to 3.5L"
                },
                {
                    value: "3.5L-5L",
                    text: "3.5L to 5L"
                },
                {
                    value: "5L",
                    text: "5L & Above"
                }
            ];
        }

        let budgetContainer = $("#budgetContainer");
        budgetContainer.empty(); // Clear previous budget options

        if (priceRanges.length > 0) {
            priceRanges.forEach(range => {
                let checkboxHTML = \`
                <fieldset class="checkbox-item style-1">
                    <label>
                        <span class="text-4">\${range.text}</span>
                        <input type="checkbox" name="price[]" class="filter-class" value="\${range.value}">
                        <span class="btn-checkbox"></span>
                    </label>
                </fieldset>
            \`;
                budgetContainer.append(checkboxHTML);
            });
        }
    }
    
    $(document).ready(function () {
        const propertyType = $('#propertytype').val();

        // Initialize price ranges based on property type
        if (propertyType === 'Sell' || propertyType === 'Rent') {
            updatePriceRanges(propertyType);
            // Don't hide the container initially, just ensure it's togglable
        }

        // Handle radio button changes
        $("input[name='listingType']").on("change", function () {
            const value = $(this).val();
            updatePriceRanges(value);
            $('#budgetContainer').slideDown();
        });

        // Ensure checkboxes are properly bound even when container is toggled
        $(document).on('change', '#budgetContainer input[type="checkbox"]', function () {
            sendFilter();
        });
    });
</script>


<script>
    $(document).ready(function () {
        sendFilter();
        
        $('.property-name-search').on('keypress', function (e) {
            if (e.which === 13) {
                e.preventDefault();
                sendFilter();
                return false;
            }
        });
        $('form').on('keypress', function (e) {
            if (e.which === 13) {
                e.preventDefault();
                sendFilter();
                return false;
            }
        });

        $('input[name="listingType"]').change(function () {
            sendFilter();
        });

        $('.property-name-search').on('keyup', function () {
            sendFilter();
        });

        $('#locationTypeDropdown .option').click(function () {
            var selectedValue = $(this).attr('data-value');
            $('#locationInput').val(selectedValue);
            sendFilter();
        });

        $(document).on('change', '.filter-class', function () {
            sendFilter();
        });

        $(document).on('click', '.page-link', function () {
            const page = $(this).data('page');
            sendFilter(page);
            $('html, body').animate({
                scrollTop: 0
            }, 200);
        });

        $(document).on('click', '.sort-option', function () {
            const sortValue = $(this).data('sort');


            $('#selectedSort').val(sortValue);
            sendFilter();
        });
    });

    let debounceTimer;

    function sendFilter(page = 1) {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(function () {
            $('#loader').show();

            // Get the current listing type (either from radio buttons or default from propertytype)
            const listingType = $('input[name="listingType"]:checked').val() || $('#propertytype').val();

            // Serialize forms and add additional parameters
            const formData = $('.property-filter, .propertysearch').serializeArray();
            formData.push({ name: 'page', value: page });

            // Ensure listingType is included even if no radio is selected
            if (!formData.some(item => item.name === 'listingType')) {
                formData.push({ name: 'listingType', value: listingType });
            }

            $.ajax({
                type: 'POST',
                url: "/Industrial/filter_search",
                data: formData,
                beforeSend: function () {
                    $('#response').empty();
                    $('#loader').show();
                },
                   success: function (response) {

    $('#response').html(response.html);

        $('#resultCountNumber').text(response.count + ' Results |');
$('#resultHeading').text(response.content);

    $('#loader').hide();
             },
                error: function () {
                    $('#loader').hide();
                    alert('An error occurred while loading data.');
                }
            });
        }, 100);
    }
</script>

<script>
    $(document).ready(function () {
        $('#toggleFilterBtn').on('click', function () {
            if ($(window).width() <= 767) {
                $('#filterSidebar').slideToggle();
            }
        });
    });
</script>

<!-- loader Script -->

<script>
  const combinedPath = document.getElementById('combinedPath');
  
  // Get the length of the combined path
  const combinedPathLength = combinedPath.getTotalLength();
  
  // Set stroke-dasharray and stroke-dashoffset to the path length
  combinedPath.style.strokeDasharray = combinedPathLength;
  combinedPath.style.strokeDashoffset = combinedPathLength;
  
  // Create a loop animation using JavaScript
  function animatePath() {
    combinedPath.animate([
      { strokeDashoffset: combinedPathLength },
      { strokeDashoffset: 0 }
    ], {
      duration: 2000,
      easing: 'ease-in-out',  // Smooth easing
      fill: 'forwards'
    }).onfinish = animatePath; // Restart animation after it finishes
  }
  
  animatePath(); // Start the animation
</script>

<script>
    $(document).ready(function () {
        $('#toggleBudget').on('click', function () {
            // Only initialize if empty
            if ($('#budgetContainer').is(':empty')) {
                const propertyType = $('#propertytype').val();
                const listingType = $('input[name="listingType"]:checked').val() || propertyType;
                if (listingType) {
                    updatePriceRanges(listingType);
                }
            }
            $('#budgetContainer').slideToggle();
        });
        $('#toggleVarient').on('click', function () {
            $('#byUnit').slideToggle();
        });
        $('#toggleFacing').on('click', function () {
            $('#byfacing').slideToggle();
        });
        $('#toggleAge').on('click', function () {
            $('#byAge').slideToggle();
        });
        $('#toggleFloor').on('click', function () {
            $('#byFloor').slideToggle();
        });
        $('#toggleFurnish').on('click', function () {
            $('#byFurnish').slideToggle();
        });
        $('#toggleArea').on('click', function () {
            $('#byArea').slideToggle();
        });
        $('#toggleProperty').on('click', function () {
            $('#byProperty').slideToggle();
        });
    });
</script>

<script>
    $(document).ready(function() {
    $('.resetbtn, .resetbtn1').click(function(e) {
        e.preventDefault();
        
        $('.filter-class').prop('checked', false);
        
        $('input[type="radio"]').prop('checked', false);
        
        $('.property-name-search').val('');
        
        $('#locationInput').val('');
        $('#locationTypeDropdown .current').text('Select location');
        
        $('#selectedSort').val('');
        
        $('[id^="by"]').slideUp();
        
        if ($('#budgetContainer').length) {
            $('#budgetContainer').empty();
        }
        
        const propertyType = $('#propertytype').val();
            if (propertyType === 'Sell' || propertyType === 'Rent') {
                updatePriceRanges(propertyType);
            }
        
        sendFilter();
    });
    
    const selectedListingType = $('input[name="listingType"]:checked').val();
    if (selectedListingType) {
        updatePriceRanges(selectedListingType);
    }
});
</script>`;

export function IndustrialView(): React.JSX.Element {
  return <LegacyHtmlFragment html={html} />;
}
