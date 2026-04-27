import { LegacyHtmlFragment } from "@/components/site/layout/legacy-html-fragment";

const html = `<section class="flat-title ">
    <div class="tf-container">
        <div class="row">
            <div class="col-lg-12">
                <div class="title-inner ">
                    <ul class="breadcrumb">
                        <li><a class="home fw-6 text-color-3" href="/">Home</a></li>
                        <li>Blog Details</li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
</section>
<!-- /flat-title -->


<!-- .main-content -->
<div class="page-content">
    <!-- page-blog-details -->
    <section class="section-blog-details ">
        <div class="tf-container">
            <div class="row blog-row">
                <div class="col-lg-8 col-md-8">
                    <div class="image-wrap mb-30">
                        <img class="lazyload main-img" data-src="/assets/images/blogimage/

<style>
.blog-content ul li,
.blog-content ol li{
    list-style: revert !important;
    list-style-position: inside !important;
}
.blog-content.summernote-output{
    overflow-x:visible !important;
}
/*.quick-links-footer ol li,*/
/*.quick-links-footer ul li{*/
/*    list-style:none !important;*/
/*}*/
    .blogs_img img {
        height: 300px;
        width: 422px;
    }
    
    .section-blog-details .image-wrap .main-img {
    width: 100%;
    aspect-ratio: 16 / 9;
    object-fit: cover;
    object-position: top;
}
.title-heading{
    font-size:32px;
    line-height:50px;
}

.blog-content.summernote-output {
        max-height: 950px;
        overflow-y: auto;
        overflow-x: hidden;
        padding-right: 8px;
    }

    .blog-content.summernote-output::-webkit-scrollbar {
        width: 6px;
    }

    .blog-content.summernote-output::-webkit-scrollbar-thumb {
        background: #cdd9ee;
        border-radius: 8px;
    }

    .blog-content.summernote-output::-webkit-scrollbar-track {
        background: transparent;
    }

.qlink-blog {
        /*background: #f2f4f7;*/
        /*border: 1px solid #e6eefb;*/
        border-radius: 14px;
        padding: 16px;
        margin-bottom: 20px;
    }

    .qlink-title {
        margin: 0 0 12px;
        font-size: 20px;
        color: #1e2b4f;
    }

    .qlink-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 8px;
    }

    .qlink-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        /*border: 1px solid #dbe7fb;*/
        border-radius: 10px;
        padding: 10px 12px;
        background: #fff;
        color: #27427f;
        font-weight: 600;
        transition: all 0.2s ease;
    }

    .qlink-item i {
        font-size: 12px;
        color: #27427F;
        display:none !important;
    }

    .qlink-item:hover {
        border-color: #27427F;
        color: #27427F;
        transform: translateX(2px);
    }


.blog-meta-share {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    border: 1px solid #ecf5ff;
    border-radius: 10px;
    padding: 12px 16px;
    background: #fff;
    width: 100%;
    box-sizing: border-box;
}

.blog-views {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: #5c5e61;
    font-weight: 600;
}

.blog-like-option {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        margin-left: 8px;
        color: #5c5e61;
        font-weight: 600;
        border: 0;
        background: transparent;
        padding: 0;
        cursor: pointer;
    }

    .blog-like-option::after {
        content: none !important;
        display: none !important;
    }

    .blog-like-option:hover {
        color: #f1913d;
    }
    
    .blog-like-option.is-liked {
        color: #27427f;
    }

.blog-share-links {
    display: inline-flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
    justify-content: flex-end;
    flex: 1;
    min-width: 0;
}

.blog-share-links .share-label {
    color: #5c5e61;
    font-weight: 600;
}

.blog-share-links a {
    border: 1px solid #dfe5ef;
    border-radius: 50%;
    width: 34px;
    height: 34px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 0;
    line-height: 1;
    white-space: nowrap;
}

.blog-share-links .share-icon {
        border: 1px solid #dfe5ef;
        border-radius: 50%;
        width: 34px;
        height: 34px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 0;
        line-height: 1;
        white-space: nowrap;
        background: #fff;
        cursor: pointer;
        padding: 0;
    }

.blog-share-links a:hover {
    border-color: #f1913d;
    color: #f1913d;
}

.share-whatsapp {
    color: #25d366;
}

.share-copy {
        color: #5c5e61;
    }

.share-facebook {
    color: #1877f2;
}

.share-x {
    color: #111;
}

.share-linkedin {
    color: #0a66c2;
}
    
    @media (max-width: 767px) {
        .summernote-output {
  width: 100%;
  overflow-x: auto;
  word-wrap: break-word;
  line-height: 1.6;
}

.summernote-output img {
  max-width: 100%;
  height: auto;
  display: block;
}

.summernote-output table {
  width: 100%;
  max-width: 100%;
  border-collapse: collapse;
  overflow-x: auto;
  display: block;
}

.summernote-output td, 
.summernote-output th {
  padding: 8px;
  word-break: break-word;
}

.summernote-output table {
  overflow-x: auto;
  display: block;
}
    }
    
/* IMPORTANT: parent ku overflow irukka koodathu */
.blog-row,
.col-lg-4,
.col-md-4 {
    overflow: visible !important;
}

/* Sticky sidebar */
.sticky-sidebar {
    position: sticky;
    top: 110px; /* header height adjust */
    background: #fff;
    box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;
    padding: 20px;
    border: 1px solid #ecf5ff;
    border-radius: 9px;
}

/* Mobile la disable */
@media (max-width: 991px) {
    .sticky-sidebar {
        position: static;
    }
    
    .blog-meta-share {
        flex-direction: column;
        align-items: flex-start;
    }

    .blog-share-links {
        justify-content: flex-start;
        width: 100%;
        flex-wrap: nowrap;
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
        gap: 6px;
    }

    .blog-share-links .share-label {
        flex: 0 0 auto;
    }

    .blog-share-links .share-icon,
    .blog-share-links a {
        width: 30px;
        height: 30px;
        min-width: 30px;
    }
    
    .section-blog-details .image-wrap .main-img{
      height: auto !important;
    }
}


</style>



<script>
function formatNumber(num) {
    try {
        return Number(num).toLocaleString("en-IN");
    } catch (e) {
        return num;
    }
}

function copyBlogLink(url) {
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(url);
        return;
    }

    var tempInput = document.createElement("input");
    tempInput.value = url;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand("copy");
    document.body.removeChild(tempInput);
}

document.addEventListener("DOMContentLoaded", function () {
    var likeBtn = document.querySelector(".js-blog-like");

    if (likeBtn) {
        var blogId = likeBtn.getAttribute("data-blog-id");
        var likeStorageKey = blogId ? ("blog_liked_" + blogId) : "";
        var likeLabelEl = document.getElementById("blogLikeLabel");

        if (likeStorageKey && localStorage.getItem(likeStorageKey) === "1") {
            likeBtn.classList.add("is-liked");
            if (likeLabelEl) {
                likeLabelEl.textContent = "Unlike";
            }
        }

        likeBtn.addEventListener("click", function () {
        var likeUrl = likeBtn.getAttribute("data-like-url");
        if (!likeUrl || likeBtn.classList.contains("is-loading")) {
            return;
        }

        likeBtn.classList.add("is-loading");

        fetch(likeUrl, {
            method: "GET",
            headers: {
                "X-Requested-With": "XMLHttpRequest"
            }
        })
            .then(function (response) { return response.json(); })
            .then(function (result) {
                if (result && result.status) {
                    var countEl = document.getElementById("blogLikesCount");
                    if (countEl) {
                        countEl.textContent = formatNumber(result.likes);
                    }
                    if (result.liked) {
                        likeBtn.classList.add("is-liked");
                        if (likeLabelEl) {
                            likeLabelEl.textContent = "Unlike";
                        }
                        if (likeStorageKey) {
                            localStorage.setItem(likeStorageKey, "1");
                        }
                    } else {
                        likeBtn.classList.remove("is-liked");
                        if (likeLabelEl) {
                            likeLabelEl.textContent = "Like";
                        }
                        if (likeStorageKey) {
                            localStorage.removeItem(likeStorageKey);
                        }
                    }
                }
            })
            .catch(function () {})
            .finally(function () {
                likeBtn.classList.remove("is-loading");
            });
        });
    }
});
</script>`;

export function BlogDetailsView(): React.JSX.Element {
  return <LegacyHtmlFragment html={html} />;
}
