export interface IMember {
    memberid: number;
    membername: string;
    memberstatus: string;
    address: string;
    host: string;
    dmsport: number;
    webport: number;
    paymentport: number;
    fingerprint: string;
    id?: string;
    text?: string;
}
