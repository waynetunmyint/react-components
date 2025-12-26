export interface Message {
    Id: string | number;
    Description: string;
    Thumbnail?: string;
    CreatedAt: string;
    SenderPageId: number;
    ReceiverPageId: number;
    ProfileEmail?: string;
    ProfileName?: string;
    SenderPageTitle?: string;
    ReceiverPageTitle?: string;
}

export interface Thread {
    PageId: number;
    PageName?: string;
    LastMessage?: string;
    LastMessageAt?: string;
    UnreadCount?: number;
}
