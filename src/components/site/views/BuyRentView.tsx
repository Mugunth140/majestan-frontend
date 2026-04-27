import { LegacyHtmlFragment } from "@/components/site/layout/legacy-html-fragment";

const html = `<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
<script>
    $(document).ready(function() {
        let defaultListingType = "Sell";
        updatePriceRanges(defaultListingType);
        sendFilter();

        $('#listingTypeDropdown .option, #locationTypeDropdown .option, #propertyTypeDropdown .option').click(function() {
            var selectedValue = $(this).data('value');
            var inputField = $(this).closest('.filter-category').find('input[type="text"]');
            if (inputField.length) {
                inputField.val(selectedValue);
            }

            handleFilterVisibility(selectedValue);
            sendFilter();
        });

        $(document).on('change', '.filter-class', function() {
            sendFilter();
        });

        $('.filter-category').not('.property-type').hide();

        $('#propertyTypeDropdown .option').click(function() {
            var selectedValue = $(this).data('value');

            // $("#propertyTypeDropdown .current").text($(this).text());
             $('.filter-class').prop('checked', false);
            $('.filter-category').show();
            handleFilterVisibility(selectedValue);
            updatesqftRanges(selectedValue);
        });
    });

    function handleFilterVisibility(propertyType) {
        $(".floor-type").toggle(propertyType === "Apartment" || propertyType === "Commercial Space");
        $(".sqft").toggle(["Industrial Space", "Commercial Space", "Farm Land", 'plots'].includes(propertyType));
        $(".facing-type").toggle(["Apartment", "Commercial Space", "plots", "Villa"].includes(propertyType));
        $(".property-use").toggle(["Industrial Space", "Commercial Space"].includes(propertyType));
        $(".unit-type").toggle(!["Industrial Space", "Commercial Space", "Farm Land", "plots"].includes(propertyType)); // Hide for these types
        $(".furnishing-type").toggle(!["Farm Land", "plots", "Industrial Space"].includes(propertyType)); // Hide for these types
        $(".age-of-property").toggle(!["Farm Land", "plots"].includes(propertyType)); // Hide Age of Property for Farm Land & Plot
    }


    function updatePriceRanges(value) {
        let priceRanges = value === "Sell" ? [{
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
        ] : [];

        let budgetContainer = $("#budgetContainer");
        budgetContainer.empty();
        priceRanges.forEach(range => {
            budgetContainer.append(\`
            <fieldset class="checkbox-item style-1">
                <label>
                    <span class="text-4">\${range.text}</span>
                    <input type="checkbox" name="price[]" class="filter-class" value="\${range.value}">
                    <span class="btn-checkbox"></span>
                </label>
            </fieldset>
        \`);
        });
    }

    function updatesqftRanges(value) {
        let sqftData = {
            "Industrial Space": [{
                    value: "500-700",
                    text: "500sqft to 700sqft"
                },
                {
                    value: "700-1000",
                    text: "700sqft to 1000sqft"
                },
                {
                    value: "1000-1500",
                    text: "1000sqft to 1500sqft"
                },
                {
                    value: "1500-2500",
                    text: "1500sqft to 2500sqft"
                },
                {
                    value: "2500-4000",
                    text: "2500sqft to 4000sqft"
                },
                {
                    value: "4000-7000",
                    text: "4000sqft to 7000sqft"
                },
                {
                    value: "7000-10000",
                    text: "7000sqft to 10000sqft"
                },
                {
                    value: "10000-15000",
                    text: "10000sqft to 15000sqft"
                },
                {
                    value: "15000-20000",
                    text: "15000sqft to 20000sqft"
                },
                {
                    value: "20000",
                    text: "20000 & Above"
                }
            ],

            "Commercial Space": [{
                    value: "500-700",
                    text: "500sqft to 700sqft"
                },
                {
                    value: "700-1000",
                    text: "700sqft to 1000sqft"
                },
                {
                    value: "1000-1500",
                    text: "1000sqft to 1500sqft"
                },
                {
                    value: "1500-2500",
                    text: "1500sqft to 2500sqft"
                },
                {
                    value: "2500-4000",
                    text: "2500sqft to 4000sqft"
                },
                {
                    value: "4000-7000",
                    text: "4000sqft to 7000sqft"
                },
                {
                    value: "7000-10000",
                    text: "7000sqft to 10000sqft"
                },
                {
                    value: "10000-15000",
                    text: "10000sqft to 15000sqft"
                },
                {
                    value: "15000-20000",
                    text: "15000sqft to 20000sqft"
                },
                {
                    value: "20000",
                    text: "20000 & Above"
                }
            ],
            "plots": [{
                    value: "1-3",
                    text: "1cent to 3cents"
                },
                {
                    value: "3-6",
                    text: "3cents to 6cents"
                },
                {
                    value: "6-10",
                    text: "6cents to 10cents"
                },
                {
                    value: "10-15",
                    text: "10cents to 15cents"
                },
                {
                    value: "15-20",
                    text: "15cents to 20cents"
                },
                {
                    value: "20-40",
                    text: "20cents to 40cents"
                },
                {
                    value: "40",
                    text: "40 & Above"
                }
            ],
            "Farm Land": [{
                    value: "1-2",
                    text: "1acre to 2acres"
                },
                {
                    value: "2-4",
                    text: "2acres to 4acres"
                },
                {
                    value: "4-6",
                    text: "4acres to 6acres"
                },
                {
                    value: "6-10",
                    text: "6acres to 10acres"
                },
                {
                    value: "10-25",
                    text: "10acres to 25acres"
                },
                {
                    value: "25-50",
                    text: "25acres to 50acres"
                },
                {
                    value: "50",
                    text: "50 & Above"
                }
            ]
        };

        let sqftContainer = $("#sqftContainer");
        sqftContainer.empty();
        (sqftData[value] || []).forEach(range => {
            sqftContainer.append(\`
            <fieldset class="checkbox-item style-1">
                <label>
                    <span class="text-4">\${range.text}</span>
                    <input type="checkbox" name="sqft[]" class="filter-class" value="\${range.value}">
                    <span class="btn-checkbox"></span>
                </label>
            </fieldset>
        \`);
        });
    }
    let debounceTimer;

 function sendFilter(page = 1) {
    clearTimeout(debounceTimer);

    $('#loader').show();

    debounceTimer = setTimeout(function () {
        const formData = $('.property-filter').serializeArray();
        formData.push({ name: 'page', value: page });

        $.ajax({
            type: 'POST',
            url: "/Home/filter_buy_search",
            data: formData,
            beforeSend: function () {
                $('#response').empty();
                $('#loader').show();
            },
            success: function (response) {
                $('#response').html(response);
            },
            error: function (xhr, status, error) {
                console.error("AJAX Error: ", status, error);
            },
            complete: function () {
                setTimeout(() => $('#loader').hide(), 100);
            }
        });
    }, 100);
}

// Handle pagination button click
$(document).on('click', '.page-btn', function () {
    const page = $(this).data('page');
    sendFilter(page);
    $('html, body').animate({
                scrollTop: 0
    }, 200);
});

</script>



<script>
    $(document).ready(function () {
        $('#toggleFilterBtn').on('click', function () {
            if ($(window).width() <= 767) {
                $('#filterSidebar').slideToggle();
            }
        });
    });
</script>`;

export function BuyRentView(): React.JSX.Element {
  return <LegacyHtmlFragment html={html} />;
}
