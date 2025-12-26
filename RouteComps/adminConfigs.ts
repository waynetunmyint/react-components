import { PAGE_ID } from "../../../config";

/**
 * Centralized configuration for all admin pages.
 * Each config defines the fields and display options for ListAdminActionComp.
 */

export interface AdminField {
    fieldName: string;
    type: "text" | "textarea" | "number" | "image" | "file" | "dropdown" | "date" | "email" | "radio" | "radioPayment" | "hundredDropdown" | "arrayVariation";
}

export interface AdminPageConfig {
    dataSource: string;
    fields: AdminField[];
    gridFields?: string[];
    subHeadingFields?: string[];
    imageField?: string;
    headingField?: string;
    imageSize?: "small" | "medium" | "large";
    activeInActiveToggle?: boolean;
    IsBill?: boolean;
    customAPI?: string;
}

export const ADMIN_PAGE_CONFIGS: Record<string, AdminPageConfig> = {

    address: {
        dataSource: "address",
        headingField: "Title",
        imageField: "Thumbnail",
        subHeadingFields: ["Description"],
        gridFields: ["PageTitle"],
        imageSize: "large",
        activeInActiveToggle: true,
        fields: [
            { fieldName: "Thumbnail", type: "image" },
            { fieldName: "Title", type: "text" },
            { fieldName: "Description", type: "textarea" },
        ],
    },

    advantage: {
        dataSource: "advantage",
        headingField: "Title",
        imageField: "Thumbnail",
        subHeadingFields: ["Description"],
        gridFields: ["PageTitle"],
        imageSize: "large",
        activeInActiveToggle: true,
        fields: [
            { fieldName: "Thumbnail", type: "image" },
            { fieldName: "Title", type: "text" },
            { fieldName: "Description", type: "textarea" },
        ],
    },

    article: {
        dataSource: "article",
        headingField: "Title",
        imageField: "Thumbnail",
        subHeadingFields: ["Description"],
        gridFields: ["PageTitle"],
        imageSize: "large",
        activeInActiveToggle: true,
        fields: [
            { fieldName: "Thumbnail", type: "image" },
            { fieldName: "Title", type: "text" },
            { fieldName: "Description", type: "textarea" },
        ],
    },

    book: {
        dataSource: "book",
        headingField: "Title",
        imageField: "Thumbnail",
        subHeadingFields: ["Description"],
        gridFields: ["BookAuthorTitle", "BookEditionTitle", "BookCategoryTitle"],
        imageSize: "medium",
        activeInActiveToggle: true,
        fields: [
            { fieldName: "BookEdition", type: "dropdown" },
            { fieldName: "BookAuthor", type: "dropdown" },
            { fieldName: "BookCategory", type: "dropdown" },
            { fieldName: "Thumbnail", type: "image" },
            { fieldName: "ThumbnailOne", type: "image" },
            { fieldName: "ThumbnailTwo", type: "image" },
            { fieldName: "ThumbnailThree", type: "image" },
            { fieldName: "PreviewPDF", type: "file" },
            { fieldName: "Title", type: "text" },
            { fieldName: "Description", type: "textarea" },
            { fieldName: "PageNumber", type: "number" },
            { fieldName: "Size", type: "text" },
            { fieldName: "Price", type: "number" },
        ],
    },

    bookAuthor: {
        dataSource: "bookAuthor",
        headingField: "Title",
        imageField: "Thumbnail",
        subHeadingFields: ["Description"],
        imageSize: "large",
        activeInActiveToggle: true,
        fields: [
            { fieldName: "Thumbnail", type: "image" },
            { fieldName: "Title", type: "text" },
            { fieldName: "Description", type: "textarea" },
        ],
    },

    bookCategory: {
        dataSource: "bookCategory",
        headingField: "Title",
        imageField: "Thumbnail",
        subHeadingFields: ["Description"],
        imageSize: "large",
        activeInActiveToggle: true,
        fields: [
            { fieldName: "Thumbnail", type: "image" },
            { fieldName: "Title", type: "text" },
            { fieldName: "Description", type: "textarea" },
        ],
    },

    bookReview: {
        dataSource: "bookReview",
        headingField: "Title",
        imageField: "Thumbnail",
        subHeadingFields: ["Description"],
        gridFields: ["BookAuthorTitle", "BookEditionTitle"],
        imageSize: "large",
        activeInActiveToggle: true,
        fields: [
            { fieldName: "Book", type: "dropdown" },
            { fieldName: "Thumbnail", type: "image" },
            { fieldName: "Title", type: "text" },
            { fieldName: "Description", type: "textarea" },
        ],
    },

    brand: {
        dataSource: "brand",
        headingField: "Title",
        imageField: "Thumbnail",
        subHeadingFields: ["Description"],
        gridFields: ["PageTitle"],
        imageSize: "large",
        activeInActiveToggle: true,
        fields: [
            { fieldName: "Thumbnail", type: "image" },
            { fieldName: "Title", type: "text" },
            { fieldName: "Description", type: "textarea" },
        ],
    },

    certificate: {
        dataSource: "certificate",
        headingField: "Title",
        subHeadingFields: ["Description"],
        gridFields: ["Batch", "CertificateNumber", "PageTitle"],
        imageSize: "large",
        activeInActiveToggle: true,
        fields: [
            { fieldName: "Title", type: "text" },
            { fieldName: "Description", type: "textarea" },
            { fieldName: "CertificateNumber", type: "text" },
            { fieldName: "Batch", type: "text" },
        ],
    },

    client: {
        dataSource: "page",
        headingField: "Title",
        imageField: "Thumbnail",
        subHeadingFields: ["Description"],
        gridFields: ["PageTitle"],
        imageSize: "large",
        activeInActiveToggle: true,
        fields: [
            { fieldName: "Thumbnail", type: "image" },
            { fieldName: "Title", type: "text" },
            { fieldName: "Description", type: "textarea" },
        ],
    },

    contactInfo: {
        dataSource: "contactInfo",
        headingField: "Title",
        imageField: "Thumbnail",
        subHeadingFields: ["Description", "Address"],
        gridFields: ["PhoneOne", "Email", "OpenTime"],
        imageSize: "large",
        activeInActiveToggle: true,
        customAPI: `contactInfo/api/byPageId/${PAGE_ID}`,
        fields: [
            { fieldName: "Thumbnail", type: "image" },
            { fieldName: "Title", type: "text" },
            { fieldName: "GoogleMapCode", type: "textarea" },
            { fieldName: "Description", type: "textarea" },
            { fieldName: "GoogleFormLink", type: "text" },
            { fieldName: "SpecialMessage", type: "textarea" },
            { fieldName: "PhoneOne", type: "text" },
            { fieldName: "Email", type: "text" },
            { fieldName: "OpenTime", type: "text" },
            { fieldName: "Address", type: "textarea" },
            { fieldName: "WebsiteURL", type: "text" },
            { fieldName: "FacebookURL", type: "text" },
            { fieldName: "InstagramURL", type: "text" },
            { fieldName: "LinkedInURL", type: "text" },
            { fieldName: "YoutubeURL", type: "text" },
            { fieldName: "TwitterURL", type: "text" },
            { fieldName: "TikTokURL", type: "text" },
            { fieldName: "VoucherHeaderImage", type: "image" },
        ],
    },

    country: {
        dataSource: "country",
        headingField: "Title",
        imageSize: "medium",
        activeInActiveToggle: true,
        fields: [
            { fieldName: "Thumbnail", type: "image" },
            { fieldName: "CoverThumbnail", type: "image" },
            { fieldName: "Title", type: "text" },
            { fieldName: "Description", type: "textarea" },

        ],
    },

    course: {
        dataSource: "course",
        headingField: "Title",
        imageField: "Thumbnail",
        subHeadingFields: ["Description"],
        gridFields: ["PageTitle", "IsZoom", "Duration"],
        imageSize: "large",
        activeInActiveToggle: true,
        fields: [
            { fieldName: "Thumbnail", type: "image" },
            { fieldName: "Title", type: "text" },
            { fieldName: "Description", type: "textarea" },
            { fieldName: "IsZoom", type: "radio" },
            { fieldName: "Duration", type: "text" }
        ],
    },

    courseBatch: {
        dataSource: "courseBatch",
        headingField: "Title",
        imageField: "Thumbnail",
        subHeadingFields: ["Description"],
        gridFields: ["CourseTitle"],
        imageSize: "large",
        activeInActiveToggle: true,
        fields: [
            { fieldName: "Course", type: "dropdown" },
            { fieldName: "Thumbnail", type: "image" },
            { fieldName: "Title", type: "text" },
            { fieldName: "Description", type: "textarea" },
        ],
    },

    courseLevel: {
        dataSource: "courseLevel",
        headingField: "Title",
        imageSize: "medium",
        activeInActiveToggle: true,
        fields: [
            { fieldName: "Title", type: "text" }
        ],
    },

    customSlider: {
        dataSource: "customSlider",
        headingField: "Title",
        imageField: "Thumbnail",
        subHeadingFields: ["Description"],
        gridFields: ["PageTitle"],
        imageSize: "large",
        activeInActiveToggle: true,
        fields: [
            { fieldName: "Thumbnail", type: "image" },
            { fieldName: "Title", type: "text" },
            { fieldName: "Description", type: "textarea" },
            { fieldName: "LinkURL", type: "text" }
        ],
    },

    customSlider2: {
        dataSource: "customSlider2",
        headingField: "Title",
        imageField: "Thumbnail",
        subHeadingFields: ["Description"],
        gridFields: ["PageTitle"],
        imageSize: "large",
        activeInActiveToggle: true,
        fields: [
            { fieldName: "Thumbnail", type: "image" },
            { fieldName: "Title", type: "text" },
            { fieldName: "Description", type: "textarea" },
            { fieldName: "LinkURL", type: "text" }
        ],
    },

    guardian: {
        dataSource: "guardian",
        headingField: "Title",
        imageField: "Thumbnail",
        subHeadingFields: ["Description"],
        gridFields: ["PageTitle"],
        imageSize: "large",
        activeInActiveToggle: true,
        fields: [
            { fieldName: "Thumbnail", type: "image" },
            { fieldName: "Title", type: "text" },
            { fieldName: "Description", type: "textarea" },
            { fieldName: "Email", type: "email" },
        ],
    },

    package: {
        dataSource: "package",
        headingField: "Title",
        imageField: "Thumbnail",
        subHeadingFields: ["Description"],
        gridFields: ["PageTitle"],
        imageSize: "large",
        activeInActiveToggle: true,
        fields: [
            { fieldName: "Thumbnail", type: "image" },
            { fieldName: "Title", type: "text" },
            { fieldName: "Description", type: "textarea" },
            { fieldName: "Price", type: "number" },
        ],
    },

    pageBill: {
        dataSource: "pageBill",
        headingField: "Title",
        imageField: "Thumbnail",
        subHeadingFields: ["Description"],
        imageSize: "medium",
        activeInActiveToggle: true,
        IsBill: true,
        fields: [
            { fieldName: "Page", type: "dropdown" },
            { fieldName: "Title", type: "text" },
            { fieldName: "EffectivePeriod", type: "text" },
            { fieldName: "Description", type: "textarea" },
            { fieldName: "Amount", type: "number" },
            { fieldName: "Status", type: "radioPayment" },
        ],
    },

    product: {
        dataSource: "product",
        headingField: "Title",
        imageField: "Thumbnail",
        subHeadingFields: ["Description"],
        gridFields: ["PageTitle"],
        imageSize: "large",
        activeInActiveToggle: true,
        fields: [
            { fieldName: "Brand", type: "dropdown" },
            { fieldName: "Thumbnail", type: "image" },
            { fieldName: "ThumbnailOne", type: "image" },
            { fieldName: "ThumbnailTwo", type: "image" },
            { fieldName: "ThumbnailThree", type: "image" },
            { fieldName: "Title", type: "text" },
            { fieldName: "Description", type: "textarea" },
            { fieldName: "Price", type: "number" },
            { fieldName: "ItemList", type: "arrayVariation" },
        ],
    },

    project: {
        dataSource: "project",
        headingField: "Title",
        imageField: "Thumbnail",
        subHeadingFields: ["Description"],
        gridFields: ["PageTitle"],
        imageSize: "large",
        activeInActiveToggle: true,
        fields: [
            { fieldName: "Thumbnail", type: "image" },
            { fieldName: "Title", type: "text" },
            { fieldName: "Description", type: "textarea" },
        ],
    },

    school: {
        dataSource: "school",
        headingField: "Title",
        imageField: "Thumbnail",
        subHeadingFields: ["Description"],
        gridFields: ["PageTitle"],
        imageSize: "large",
        activeInActiveToggle: true,
        fields: [
            { fieldName: "Thumbnail", type: "image" },
            { fieldName: "Title", type: "text" },
            { fieldName: "Description", type: "textarea" },
        ],
    },

    schoolBill: {
        dataSource: "schoolBill",
        headingField: "Title",
        imageField: "Thumbnail",
        subHeadingFields: ["Description"],
        gridFields: ["StudentTitle", "SchoolTitle"],
        imageSize: "large",
        activeInActiveToggle: true,
        fields: [
            { fieldName: "Student", type: "dropdown" },
            { fieldName: "School", type: "dropdown" },
            { fieldName: "Thumbnail", type: "image" },
            { fieldName: "Title", type: "text" },
            { fieldName: "Description", type: "textarea" },
            { fieldName: "Amount", type: "number" },
        ],
    },

    service: {
        dataSource: "service",
        headingField: "Title",
        imageField: "Thumbnail",
        subHeadingFields: ["Description"],
        gridFields: ["PageTitle"],
        imageSize: "large",
        activeInActiveToggle: true,
        fields: [
            { fieldName: "Thumbnail", type: "image" },
            { fieldName: "Title", type: "text" },
            { fieldName: "Description", type: "textarea" },
        ],
    },

    slider: {
        dataSource: "slider",
        headingField: "Title",
        imageField: "Thumbnail",
        subHeadingFields: ["Description"],
        gridFields: ["PageTitle"],
        imageSize: "large",
        activeInActiveToggle: true,
        fields: [
            { fieldName: "Thumbnail", type: "image" },
            { fieldName: "Title", type: "text" },
            { fieldName: "Description", type: "textarea" },
        ],
    },

    student: {
        dataSource: "student",
        headingField: "Title",
        imageField: "Thumbnail",
        subHeadingFields: ["Description"],
        gridFields: ["GuardianTitle", "SchoolTitle"],
        imageSize: "large",
        activeInActiveToggle: true,
        fields: [
            { fieldName: "Guardian", type: "dropdown" },
            { fieldName: "School", type: "dropdown" },
            { fieldName: "Thumbnail", type: "image" },
            { fieldName: "Title", type: "text" },
            { fieldName: "Description", type: "textarea" },
        ],
    },

    testimonial: {
        dataSource: "testimonial",
        headingField: "Title",
        imageField: "Thumbnail",
        subHeadingFields: ["Description"],
        gridFields: ["PageTitle", "PersonName", "PersonJobTitle"],
        imageSize: "large",
        activeInActiveToggle: true,
        fields: [
            { fieldName: "Thumbnail", type: "image" },
            { fieldName: "Title", type: "text" },
            { fieldName: "Description", type: "textarea" },
            { fieldName: "PersonName", type: "text" },
            { fieldName: "PersonJobTitle", type: "text" },
        ],
    },

    university: {
        dataSource: "university",
        headingField: "Title",
        imageField: "Thumbnail",
        subHeadingFields: ["Description"],
        gridFields: ["PageTitle", "CountryTitle"],
        imageSize: "large",
        activeInActiveToggle: true,
        fields: [
            { fieldName: "Page", type: "dropdown" },
            { fieldName: "Thumbnail", type: "image" },
            { fieldName: "Title", type: "text" },
            { fieldName: "Description", type: "textarea" },
        ],
    },
};

