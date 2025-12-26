export interface Message {
    id: string | number;
    text: string;
    sender: 'guest' | 'page';
    time: string;
    status?: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
    links?: {
        web?: string;
        android?: string;
        ios?: string;
    };
    link?: string;
    title?: string;
    author?: string;
    thumbnail?: string;
    image?: string;
    items?: Array<{
        title?: string;
        author?: string;
        thumbnail?: string;
        link?: string;
        links?: {
            web?: string;
            android?: string;
            ios?: string;
        };
        image?: string;
        description?: string;
        price?: string | number;
        id?: string | number;
        type?: string;
    }>;
    displayType?: 'normal' | 'carousel' | 'list';
}

export interface GuestInfo {
    name: string;
    phone: string;
    email: string;
}

export interface AdminThread {
    GuestId: string;
    GuestName: string;
    GuestPhone: string;
    GuestEmail?: string;
    Id: number;
    ItemList?: string | Message[];
    CreatedAt?: string;
    UpdatedAt?: string;
    IsAIActive?: string | number;
}
