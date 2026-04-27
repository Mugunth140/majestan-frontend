import { LegacyHtmlFragment } from "@/components/site/layout/legacy-html-fragment";

const html = `<script>
            $(document).ready(function () {
                updateWishlistCount();
            })

            function updateWishlistCount() {
                $.ajax({
                    url: '/Apartment/get_wishlist_count',
                    type: 'GET',
                    dataType: 'json',
                    success: function (response) {
                        if (response.success && response.cart_count > 0) {
                            $('.wishlist-count-border').text(response.cart_count).show();
                        } else {
                            $('.wishlist-count-border').hide();
                        }
                    },
                    error: function (xhr, status, error) {
                        console.error('Error loading wishlist count:', error);
                    }
                });
            }
            $(document).on('click', '.wishlist', function (e) {
                e.preventDefault();

                var $this = $(this);
                var productId = $this.data('product-id');
                var propertyType = $this.data('property');

                $.ajax({
                    url: '/Wishlist/toggle_wishlist',
                    type: 'POST',
                    data: {
                        property_id: productId,
                        property_type: propertyType
                    },  
                    dataType: 'json',
                    success: function (response) {
                        updateWishlistCount();

                        console.log(response.action);

                        if (response.success) {
                            if (response.action === 'added') {
                                $this.addClass('active');
                            } else {
                                $this.removeClass('active');
                                window.location.reload();
                          
                            }

                            $('#wishlist-count').text(response.wishlist_count);
                        } else {
                            
                        }
                    },
                    error: function () {
                      
                    }
                });
            });

        </script>
        
        <style>
        .wishlist-else-img{
            width:80% !important;
        }
            @media only screen and (max-width : 767px) {
                .wishlist-else-img
                {
                    width: 95% !important;
                }
            }
        </style>`;

export function WishlistView(): React.JSX.Element {
  return <LegacyHtmlFragment html={html} />;
}
