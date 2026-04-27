import { LegacyHtmlFragment } from "@/components/site/layout/legacy-html-fragment";

const html = `<div class="row">

   
   <div class="col-md-6 mb-4">
        <div class="box-house hover-img">
            <div class="blog-article-item style-2">
                <div class="image-wrap blogs_img">
                    <a href="/-b" target="_blank">
                        <img class="lazyload" 
                             src="/assets/images/blogimage/" 
                             alt="">
                    </a>
                </div>

                <div class="article-content">
                    <h4 class="title line-clamp-3">
                        <a href="/-b" target="_blank">
                            
                        </a>
                    </h4>

                    <a href="/-b" class="tf-btn-link" target="_blank">
                        Read More →
                    </a>
                </div>
            </div>
        </div>
   </div>


</div>


    <div class="entries" style="margin-bottom: 15px; margin-top: 20px;">
        <p>Showing <span style="color: #28427F; font-weight: 600;"></span> to <span style="color: #28427F; font-weight: 600;"></span> of <span style="color: #28427F; font-weight: 600;"></span> results</p>
    </div>

<!-- Pagination -->

    <div class="text-center d-flex justify-content-center align-items-center">
        <div class="pagination" style="margin-top: 20px; display: flex; gap: 10px;">

            
                <a href="javascript:void(0);" class="page-link" data-page=""> Prev</a>
            

            
                <a href="javascript:void(0);" class="page-link " data-page=""></a>
            

            
                <a href="javascript:void(0);" class="page-link" data-page="">Next </a>
            
        </div>
    </div>




<style>
    .blogs_img img {
        width: 100%;
    aspect-ratio: 16 / 9;
    object-fit: cover;
    object-position: top;
    }
</style>`;

export function Blogs1View(): React.JSX.Element {
  return <LegacyHtmlFragment html={html} />;
}
