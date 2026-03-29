export type RoastProcess = "Natural" | "Washed";
export type RoastCategory = "Filter" | "Espresso";
export type RoastDegree =
    | "Light"
    | "Light-Medium"
    | "Medium"
    | "Medium-Dark"
    | "Dark";
export type DevelopmentTime = "Low" | "Medium" | "High";

export interface NewProfileTemplate {
    id: string;
    process: RoastProcess;
    category: RoastCategory;
    roastDegree: RoastDegree;
    developmentTime: DevelopmentTime;
    name: string;
    durationLabel: string;
    notes: string;
    roastProfileLink: string;
}

export const NEW_PROFILE_TEMPLATES: NewProfileTemplate[] = [
    {
        "id": "natural_espresso_dark_high_hr9vmfvzmdheax8ygnes",
        "process": "Natural",
        "category": "Espresso",
        "roastDegree": "Dark",
        "developmentTime": "High",
        "name": "Natural Espresso Dark (High Dev)",
        "durationLabel": "Development 65.37%",
        "notes": "IKAWA natural template",
        "roastProfileLink": "https://share.ikawa.support/profile_home/?CAESEDLEWUuYk0v9udiISW2PuYgaGU5hdHVyYWwgZXNwcmVzc28gZGFyayArKysiBQgAEPQDIgYIuQMQ7Q8iBgiuDhDoESIGCMoVEO8UIgYIhyIQrxQqBQgAEMwBKgYItxAQyQEqBgiHIhCxATABOgYIkycQwwFCJgoccENMMjJvd3A3ZlpJY1VNRHd6b012WGFsdGVYMhIAGgAiACgA"
    },
    {
        "id": "natural_espresso_dark_low_jawnbmwedztcemdyxybl",
        "process": "Natural",
        "category": "Espresso",
        "roastDegree": "Dark",
        "developmentTime": "Low",
        "name": "Natural Espresso Dark (Low Dev)",
        "durationLabel": "Development 70.23%",
        "notes": "IKAWA natural template",
        "roastProfileLink": "https://share.ikawa.support/profile_home/?CAESEKHy86SluEiPiZH99hRw+44aF05hdHVyYWwgZXNwcmVzc28gZGFyayArIgUIABD0AyIGCJkHEIMRIgYIrg4Q6BEiBgiCEhClFCIGCPoZEIgVIgYIwB4Q1hMqBQgAEMwBKgYItxAQyQEqBgjAHhCsATABOgYIzCMQzAFCJgoccENMMjJvd3A3ZlpJY1VNRHd6b012WGFsdGVYMhIAGgAiACgA"
    },
    {
        "id": "natural_espresso_dark_medium_rx6vbr8gwviec1bbqewg",
        "process": "Natural",
        "category": "Espresso",
        "roastDegree": "Dark",
        "developmentTime": "Medium",
        "name": "Natural Espresso Dark (Medium Dev)",
        "durationLabel": "Development 66.12%",
        "notes": "IKAWA natural template",
        "roastProfileLink": "https://share.ikawa.support/profile_home/?CAESEDG7mZOP4kNxrdfw1T12lj0aGE5hdHVyYWwgZXNwcmVzc28gZGFyayArKyIFCAAQ9AMiBgiQBRD0DyIGCK4OEOgRIgYI/xgQjBUiBgiWHBCNFSIGCNAhEMEUKgUIABDMASoGCLcQEMkBKgYI0CEQsQEwAToGCNwmEMMBQiYKHHBDTDIyb3dwN2ZaSWNVTUR3em9NdlhhbHRlWDISABoAIgAoAA=="
    },
    {
        "id": "natural_espresso_light_high_hvsu09i2iq8yltyvgtef",
        "process": "Natural",
        "category": "Espresso",
        "roastDegree": "Light",
        "developmentTime": "High",
        "name": "Natural Espresso Light (High Dev)",
        "durationLabel": "Development 72.76%",
        "notes": "IKAWA natural template",
        "roastProfileLink": "https://share.ikawa.support/profile_home/?CAESEKV1P805qUuItyumoXg+j6gaGk5hdHVyYWwgZXNwcmVzc28gbGlnaHQgKysrIgUIABD0AyIGCPAEEIUMIgYIog0QlRMiBgiFIRDMEioFCAAQ1wEqBgjtCRDSASoGCIUhELIBMAE6BgiRJhDMAUImChxwQ0wyMm93cDdmWkljVU1Ed3pvTXZYYWx0ZVgyEgAaACIAKAA="
    },
    {
        "id": "natural_espresso_light_low_efffbyr3kdaz3djprqra",
        "process": "Natural",
        "category": "Espresso",
        "roastDegree": "Light",
        "developmentTime": "Low",
        "name": "Natural Espresso Light (Low Dev)",
        "durationLabel": "Development 90.04%",
        "notes": "IKAWA natural template",
        "roastProfileLink": "https://share.ikawa.support/profile_home/?CAESEKuFqOlEeU6hquTm3GN0XPgaF05hdHVyYWwgRXNwcmVzc28gTGlnaHQrIgUIABD0AyIGCKIEEIgSIgYImQoQohEiBgiZEBDCESIGCIMXELkTIgYI8xgQtRMiBgjEHBCJEyoFCAAQxQEqBgiTFRC7ASoGCMQcEKwBMAE6BgjPIRDMAUImChxwQ0wyMm93cDdmWkljVU1Ed3pvTXZYYWx0ZVgyEgAaACIAKAA="
    },
    {
        "id": "natural_espresso_light_medium_le8dorhxtvlu7e5plyg5",
        "process": "Natural",
        "category": "Espresso",
        "roastDegree": "Light",
        "developmentTime": "Medium",
        "name": "Natural Espresso Light (Medium Dev)",
        "durationLabel": "Development 87.61%",
        "notes": "IKAWA natural template",
        "roastProfileLink": "https://share.ikawa.support/profile_home/?CAESEJaRcP1q2kERmbOwN4ZdcgoaGU5hdHVyYWwgZXNwcmVzc28gbGlnaHQgKysiBQgAEPQDIgYImQoQohEiBgiUERDdEiIGCPMYELUTIgYI5B0QiRMqBQgAEMUBKgYIkxUQuwEqBgjkHRCsATABOgYI7yIQzAFCJgoccENMMjJvd3A3ZlpJY1VNRHd6b012WGFsdGVYMhIAGgAiACgA"
    },
    {
        "id": "natural_espresso_light_medium_high_xoyqgsql6dxh9u40pdzp",
        "process": "Natural",
        "category": "Espresso",
        "roastDegree": "Light-Medium",
        "developmentTime": "High",
        "name": "Natural Espresso Light-Medium (High Dev)",
        "durationLabel": "Development 69.18%",
        "notes": "IKAWA natural template",
        "roastProfileLink": "https://share.ikawa.support/profile_home/?CAESEGx7DW3X/EVyjfxlCEYZgT8aHE5hdHVyYWwgZXNwLiBsaWdodC1tZWRpdW0rKysiBQgAEPQDIgUIWhD7ByIGCPYDEMEQIgYI3QwQ3xAiBgjLFhDvEyIGCLciEIETKgUIABDQASoGCNgVEL8BKgYItyIQrQEwAToGCP8nEMUBQiYKHHBDTDIyb3dwN2ZaSWNVTUR3em9NdlhhbHRlWDISABoAIgAoAA=="
    },
    {
        "id": "natural_espresso_light_medium_low_mlhmo3iy1zks2oq47ah2",
        "process": "Natural",
        "category": "Espresso",
        "roastDegree": "Light-Medium",
        "developmentTime": "Low",
        "name": "Natural Espresso Light-Medium (Low Dev)",
        "durationLabel": "Development 84.33%",
        "notes": "IKAWA natural template",
        "roastProfileLink": "https://share.ikawa.support/profile_home/?CAESEECw4w0kOU98mLzBeV5CdOkaH05hdHVyYWwgZXNwcmVzc28gbGlnaHQtbWVkaXVtICsiBQgAEPQDIgYI3AQQ+g4iBgj5ExCNESIGCKMZEKYUIgYI+CAQ8BIqBQgAEMQBKgYIoA4QwwEqBgj4IBCiATABOgYIpSgQzAFCJgoccENMMjJvd3A3ZlpJY1VNRHd6b012WGFsdGVYMhIAGgAiACgA"
    },
    {
        "id": "natural_espresso_light_medium_medium_tgbbvea9yxqokhzl2nnb",
        "process": "Natural",
        "category": "Espresso",
        "roastDegree": "Light-Medium",
        "developmentTime": "Medium",
        "name": "Natural Espresso Light-Medium (Medium Dev)",
        "durationLabel": "Development 80.31%",
        "notes": "IKAWA natural template",
        "roastProfileLink": "https://share.ikawa.support/profile_home/?CAESEEzfLkLQgkF9lUvwFnAaBmQaHk5hdHVyYWwgZXNwcmVzc28gbGlnaHRtZWRpdW0rKyIFCAAQ9AMiBgjJAxDKDSIGCO4ZEPcTIgYIhiIQyxIqBQgAENcBKgYI7QkQ0gEqBgiGIhCyATABOgYIkicQzAFCJgoccENMMjJvd3A3ZlpJY1VNRHd6b012WGFsdGVYMhIAGgAiACgA"
    },
    {
        "id": "natural_espresso_medium_high_4irzvzjyu6jqrymsfh18",
        "process": "Natural",
        "category": "Espresso",
        "roastDegree": "Medium",
        "developmentTime": "High",
        "name": "Natural Espresso Medium (High Dev)",
        "durationLabel": "Development 65.29%",
        "notes": "IKAWA natural template",
        "roastProfileLink": "https://share.ikawa.support/profile_home/?CAESEFU3UuNtW0julnP+gMHnXioaG05hdHVyYWwgZXNwcmVzc28gbWVkaXVtICsrKyIFCAAQ9AMiBginBBCcECIGCIcSEMITIgYIyRkQ/hMiBgiAHhCaEyIGCOggEJATKgUIABDUASoGCOggEK0BMAE6BgiWKhDOAUImChxwQ0wyMm93cDdmWkljVU1Ed3pvTXZYYWx0ZVgyEgAaACIAKAA="
    },
    {
        "id": "natural_espresso_medium_low_suuvj46du8b1wrjxass6",
        "process": "Natural",
        "category": "Espresso",
        "roastDegree": "Medium",
        "developmentTime": "Low",
        "name": "Natural Espresso Medium (Low Dev)",
        "durationLabel": "Development 80.07%",
        "notes": "IKAWA natural template",
        "roastProfileLink": "https://share.ikawa.support/profile_home/?CAESEAgEknxgYURdhMeJ37oA2b4aGU5hdHVyYWwgZXNwcmVzc28gbWVkaXVtICsiBQgAEPQDIgYI0wcQuw8iBgi3EBCQESIGCKMZEKYUIgYIziEQkhMqBQgAEMQBKgYIoA4QwwEqBgjOIRCiATABOgYI+ygQzAFCJgoccENMMjJvd3A3ZlpJY1VNRHd6b012WGFsdGVYMhIAGgAiACgA"
    },
    {
        "id": "natural_espresso_medium_medium_ohcvesthhgtqrdjonpml",
        "process": "Natural",
        "category": "Espresso",
        "roastDegree": "Medium",
        "developmentTime": "Medium",
        "name": "Natural Espresso Medium (Medium Dev)",
        "durationLabel": "Development 70.23%",
        "notes": "IKAWA natural template",
        "roastProfileLink": "https://share.ikawa.support/profile_home/?CAESEKbQ6JOuzEdyuapspR6JgSYaGk5hdHVyYWwgZXNwcmVzc28gbWVkaXVtICsrIgUIABD0AyIGCLECENILIgYIpAYQqQ8iBgjdDBCqEiIGCOsSEKkUIgYIwh4Q1hMqBQgAEMoBKgYIwh4QrQEwAToGCIokEMUBQiYKHHBDTDIyb3dwN2ZaSWNVTUR3em9NdlhhbHRlWDISABoAIgAoAA=="
    },
    {
        "id": "natural_espresso_medium_dark_high_o3roozyms0bnig2qhncx",
        "process": "Natural",
        "category": "Espresso",
        "roastDegree": "Medium-Dark",
        "developmentTime": "High",
        "name": "Natural Espresso Medium-Dark (High Dev)",
        "durationLabel": "Development 59.70%",
        "notes": "IKAWA natural template",
        "roastProfileLink": "https://share.ikawa.support/profile_home/?CAESECLLliohEEzJizPAOQi7SYMaHk5hdHVyYWwgZXNwcmVzc28gbWVkaXVtZGFyaysrKyIFCAAQ9AMiBgilBxCKEiIGCIMXEKMUIgYIxxwQhhQiBgj8IxCAEyoFCAAQ0AEqBgjYFRC/ASoGCPwjEK0BMAE6BgjEKRDFAUImChxwQ0wyMm93cDdmWkljVU1Ed3pvTXZYYWx0ZVgyEgAaACIAKAA="
    },
    {
        "id": "natural_espresso_medium_dark_low_28y1ar4knuv3uour2qdb",
        "process": "Natural",
        "category": "Espresso",
        "roastDegree": "Medium-Dark",
        "developmentTime": "Low",
        "name": "Natural Espresso Medium-Dark (Low Dev)",
        "durationLabel": "Development 69.18%",
        "notes": "IKAWA natural template",
        "roastProfileLink": "https://share.ikawa.support/profile_home/?CAESENWedOJOpEaXiuQfATVaOWAaHU5hdHVyYWwgZXNwcmVzc28gbWVkaXVtLWRhcmsrIgUIABD0AyIGCLwBELIJIgYIvgwQoBIiBgiDFxCjFCIGCJIeEI8UIgYItyIQgRMqBQgAENABKgYI2BUQvwEqBgi3IhCtATABOgYI/ycQxQFCJgoccENMMjJvd3A3ZlpJY1VNRHd6b012WGFsdGVYMhIAGgAiACgA"
    },
    {
        "id": "natural_espresso_medium_dark_medium_gypd9yb3zvsvl3qw6pzd",
        "process": "Natural",
        "category": "Espresso",
        "roastDegree": "Medium-Dark",
        "developmentTime": "Medium",
        "name": "Natural Espresso Medium-Dark (Medium Dev)",
        "durationLabel": "Development 63.50%",
        "notes": "IKAWA natural template",
        "roastProfileLink": "https://share.ikawa.support/profile_home/?CAESECC2wPz9LEkYjSs1dt6axn8aHk5hdHVyYWwgZXNwcmVzc28gbWVkaXVtZGFyayArKyIFCAAQ9AMiBgjTBxC7DyIGCLcQEJARIgYIoxkQphQiBgjOIRCSEyoFCAAQxAEqBgigDhDDASoGCM4hEKIBMAE6Bgj7KBDMAUImChxwQ0wyMm93cDdmWkljVU1Ed3pvTXZYYWx0ZVgyEgAaACIAKAA="
    },
    {
        "id": "natural_filter_dark_high_aztox6mw5zjlhjokkdc3",
        "process": "Natural",
        "category": "Filter",
        "roastDegree": "Dark",
        "developmentTime": "High",
        "name": "Natural Filter Dark (High Dev)",
        "durationLabel": "Development 67.67%",
        "notes": "IKAWA natural template",
        "roastProfileLink": "https://share.ikawa.support/profile_home/?CAESEAmXSl0+nURgr3NGazoSPu0aF05hdHVyYWwgRmlsdGVyIERhcmsgKysrIgUIABD0AyIGCKsCEPgPIgYIuwUQ4QsiBgi6ERCxEyIGCIwZEIsVIgYIhiIQuhQqBQgAEMwBKgYIkBAQxQEqBgiGIhCsATABOgYIkicQzAFCJgoccENMMjJvd3A3ZlpJY1VNRHd6b012WGFsdGVYMhIAGgAiACgA"
    },
    {
        "id": "natural_filter_dark_low_dzzvionmofprkxtz86xr",
        "process": "Natural",
        "category": "Filter",
        "roastDegree": "Dark",
        "developmentTime": "Low",
        "name": "Natural Filter Dark (Low Dev)",
        "durationLabel": "Development 69.35%",
        "notes": "IKAWA natural template",
        "roastProfileLink": "https://share.ikawa.support/profile_home/?CAESEKKf5PXdHks1h4QudhbsiUMaFU5hdHVyYWwgRmlsdGVyIGRhcmsgKyIFCAAQ9AMiBgjDAxDaDCIGCNsJEJ4SIgYIqRMQvhMiBgjjGhCLFSIGCPceEL8UKgUIABDMASoGCNkOEL8BKgYI9x4QrAEwAToGCOEnEMMBQiYKHHBDTDIyb3dwN2ZaSWNVTUR3em9NdlhhbHRlWDISABoAIgAoAA=="
    },
    {
        "id": "natural_filter_dark_medium_7n2ritafa2qtwugu6b1m",
        "process": "Natural",
        "category": "Filter",
        "roastDegree": "Dark",
        "developmentTime": "Medium",
        "name": "Natural Filter Dark (Medium Dev)",
        "durationLabel": "Development 65.00%",
        "notes": "IKAWA natural template",
        "roastProfileLink": "https://share.ikawa.support/profile_home/?CAESEDT81ZPkXEM5qSQVjhNYXcIaFk5hdHVyYWwgZmlsdGVyIGRhcmsgKysiBQgAEPQDIgUIWhD7ByIGCPYDEMEQIgYIvgwQoBIiBgj3EhCMFSIGCMEXEJQVIgYIqh0QwBQqBQgAEM4BKgYIqh0QtwEwAToGCPIiEMUBQiYKHHBDTDIyb3dwN2ZaSWNVTUR3em9NdlhhbHRlWDISABoAIgAoAA=="
    },
    {
        "id": "natural_filter_light_high_olnlcu9nmoa4wyhti8rs",
        "process": "Natural",
        "category": "Filter",
        "roastDegree": "Light",
        "developmentTime": "High",
        "name": "Natural Filter Light (High Dev)",
        "durationLabel": "Development 83.72%",
        "notes": "IKAWA natural template",
        "roastProfileLink": "https://share.ikawa.support/profile_home/?CAESEAtpuI44dEnOvdankpT/mnEaGE5hdHVyYWwgRmlsdGVyIGxpZ2h0ICsrKyIFCAAQ9AMiBgiqBBDJDSIGCIQOEMgQIgYIgBgQ/BMiBgjXHxDTEyoFCAAQzQEqBgjXHxC3ATABOgYI+yUQywFCJgoccENMMjJvd3A3ZlpJY1VNRHd6b012WGFsdGVYMhIAGgAiACgA"
    },
    {
        "id": "natural_filter_light_low_d7nnvmhuutil1ylbdi0f",
        "process": "Natural",
        "category": "Filter",
        "roastDegree": "Light",
        "developmentTime": "Low",
        "name": "Natural Filter Light (Low Dev)",
        "durationLabel": "Development 93.11%",
        "notes": "IKAWA natural template",
        "roastProfileLink": "https://share.ikawa.support/profile_home/?CAESEPbvuEFDy0bXjgARt298oZUaFk5hdHVyYWwgRmlsdGVyIGxpZ2h0ICsiBQgAEPQDIgYInwIQtgkiBgiRCBDrDCIGCIQOEMgQIgYIgBgQ/BMiBgjnHRDKEyoFCAAQzQEqBgjnHRC3ATABOgYIiyQQywFCJgoccENMMjJvd3A3ZlpJY1VNRHd6b012WGFsdGVYMhIAGgAiACgA"
    },
    {
        "id": "natural_filter_light_medium_bp6ctmnnfeipzs32ljet",
        "process": "Natural",
        "category": "Filter",
        "roastDegree": "Light",
        "developmentTime": "Medium",
        "name": "Natural Filter Light (Medium Dev)",
        "durationLabel": "Development 76.00%",
        "notes": "IKAWA natural template",
        "roastProfileLink": "https://share.ikawa.support/profile_home/?CAESEFm7Vu7skkRKjqtKRuoovmQaF05hdHVyYWwgZmlsdGVyIGxpZ2h0ICsrIgUIABD0AyIGCJUBEOULIgYIpwQQnBAiBgj+ChD1EyIGCL8SEPcSIgYItxcQ4RIqBQgAENQBKgYIoAgQvQEqBgi3FxCkATABOgYI5SAQzgFCJgoccENMMjJvd3A3ZlpJY1VNRHd6b012WGFsdGVYMhIAGgAiACgA"
    },
    {
        "id": "natural_filter_light_medium_high_1coxoiol1uu4hlt4iiwk",
        "process": "Natural",
        "category": "Filter",
        "roastDegree": "Light-Medium",
        "developmentTime": "High",
        "name": "Natural Filter Light-Medium (High Dev)",
        "durationLabel": "Development 73.22%",
        "notes": "IKAWA natural template",
        "roastProfileLink": "https://share.ikawa.support/profile_home/?CAESEKdJaRySnkGjnUljOWjWY9oaHk5hdHVyYWwgZmlsdGVyIGxpZ2h0bWVkaXVtICsrKyIFCAAQ9AMiBgjVARDMBiIGCL0FEK8QIgYI/xMQ/BMiBgiUHBCvEioFCAAQzAEqBgiUHBCtATABOgYIsyQQwAFCJgoccENMMjJvd3A3ZlpJY1VNRHd6b012WGFsdGVYMhIAGgAiACgA"
    },
    {
        "id": "natural_filter_light_medium_low_ndd1bzcr7m47vtewd2c6",
        "process": "Natural",
        "category": "Filter",
        "roastDegree": "Light-Medium",
        "developmentTime": "Low",
        "name": "Natural Filter Light-Medium (Low Dev)",
        "durationLabel": "Development 87.36%",
        "notes": "IKAWA natural template",
        "roastProfileLink": "https://share.ikawa.support/profile_home/?CAESEKDVADGASk4dvxeRWTKKllUaHE5hdHVyYWwgZmlsdGVyIGxpZ2h0LW1lZGl1bSsiBQgAEPQDIgYIjwMQlxAiBgi/FhD4EyIGCOYZEIgTKgUIABDQASoGCOYZELUBMAE6BgiFIhDAAUImChxwQ0wyMm93cDdmWkljVU1Ed3pvTXZYYWx0ZVgyEgAaACIAKAA="
    },
    {
        "id": "natural_filter_light_medium_medium_y5mbpiukf798kqpwhcwf",
        "process": "Natural",
        "category": "Filter",
        "roastDegree": "Light-Medium",
        "developmentTime": "Medium",
        "name": "Natural Filter Light-Medium (Medium Dev)",
        "durationLabel": "Development 78.94%",
        "notes": "IKAWA natural template",
        "roastProfileLink": "https://share.ikawa.support/profile_home/?CAESEA3ooMt+aEw/omqk1coC6sgaHU5hdHVyYWwgZmlsdGVyIGxpZ2h0LW1lZGl1bSsrIgUIABD0AyIGCJUBEOULIgYIpwQQnBAiBgjJERCHFCIGCM0aEMoTKgUIABDUASoGCKAIEL0BKgYIzRoQpAEwAToGCPsjEM4BQiYKHHBDTDIyb3dwN2ZaSWNVTUR3em9NdlhhbHRlWDISABoAIgAoAA=="
    },
    {
        "id": "natural_filter_medium_high_qzi2zrozjis5qobs8fzt",
        "process": "Natural",
        "category": "Filter",
        "roastDegree": "Medium",
        "developmentTime": "High",
        "name": "Natural Filter Medium (High Dev)",
        "durationLabel": "Development 70.05%",
        "notes": "IKAWA natural template",
        "roastProfileLink": "https://share.ikawa.support/profile_home/?CAESEOOGFTXTxUiumvO/97xYTKAaGU5hdHVyYWwgZmlsdGVyIG1lZGl1bSArKysiBQgAEPQDIgYIuQIQ2QwiBgiHEBCJEyIGCM8YENkUIgYIth0QvBQiBgjsIBDBEyoFCAAQzAEqBgiQEBDFASoGCOwgELcBMAE6Bgj4JRDMAUImChxwQ0wyMm93cDdmWkljVU1Ed3pvTXZYYWx0ZVgyEgAaACIAKAA="
    },
    {
        "id": "natural_filter_medium_low_dlnirftcb80rhy0lkx1d",
        "process": "Natural",
        "category": "Filter",
        "roastDegree": "Medium",
        "developmentTime": "Low",
        "name": "Natural Filter Medium (Low Dev)",
        "durationLabel": "Development 77.92%",
        "notes": "IKAWA natural template",
        "roastProfileLink": "https://share.ikawa.support/profile_home/?CAESEMtZ5gC0q0Pfi5sEgHAOiRAaF05hdHVyYWwgZmlsdGVyIG1lZGl1bSArIgUIABD0AyIGCMMDENoMIgYInwoQ8hAiBgiEExDoEyIGCMcYEKgUIgYIvx4Q9hMqBQgAEMkBKgYIvx4QpAEwAToGCM4nELsBQiYKHHBDTDIyb3dwN2ZaSWNVTUR3em9NdlhhbHRlWDISABoAIgAoAA=="
    },
    {
        "id": "natural_filter_medium_medium_onwxk05qmyi2xkmncyqd",
        "process": "Natural",
        "category": "Filter",
        "roastDegree": "Medium",
        "developmentTime": "Medium",
        "name": "Natural Filter Medium (Medium Dev)",
        "durationLabel": "Development 73.50%",
        "notes": "IKAWA natural template",
        "roastProfileLink": "https://share.ikawa.support/profile_home/?CAESENjhAAUhnkQAplPnwA2SiJYaGE5hdHVyYWwgZmlsdGVyIG1lZGl1bSArKyIFCAAQ9AMiBgimAxDkDCIGCM8IEKMQIgYI6xQQ1hQiBgjuFxCeEiIGCKUfEPgSKgUIABDMASoGCKUfELUBMAE6BgixJBDMAUImChxwQ0wyMm93cDdmWkljVU1Ed3pvTXZYYWx0ZVgyEgAaACIAKAA="
    },
    {
        "id": "natural_filter_medium_dark_high_9twisucxy5uzi6y9gb0w",
        "process": "Natural",
        "category": "Filter",
        "roastDegree": "Medium-Dark",
        "developmentTime": "High",
        "name": "Natural Filter Medium-Dark (High Dev)",
        "durationLabel": "Development 69.75%",
        "notes": "IKAWA natural template",
        "roastProfileLink": "https://share.ikawa.support/profile_home/?CAESEIv1FfanHE38q4FNqX0VZH4aHk5hdHVyYWwgRmlsdGVyIG1lZGl1bS1kYXJrICsrKyIFCAAQ9AMiBQhWEOALIgYIxw4QyRIiBgiAGhDWFCIGCKAfELAUKgUIABDWASoGCOAREMUBKgYIoB8QrQEwAToGCOgkEMUBQiYKHHBDTDIyb3dwN2ZaSWNVTUR3em9NdlhhbHRlWDISABoAIgAoAA=="
    },
    {
        "id": "natural_filter_medium_dark_low_jhgrrbotmyckzaydy55x",
        "process": "Natural",
        "category": "Filter",
        "roastDegree": "Medium-Dark",
        "developmentTime": "Low",
        "name": "Natural Filter Medium-Dark (Low Dev)",
        "durationLabel": "Development 73.19%",
        "notes": "IKAWA natural template",
        "roastProfileLink": "https://share.ikawa.support/profile_home/?CAESEEc2XDGk6kuGsg8mAAdMg38aHE5hdHVyYWwgZmlsdGVyIG1lZGl1bS1kYXJrICsiBQgAEPQDIgYIwwMQ2gwiBgjbCRCeEiIGCKkTEL4TIgYI4xoQixUiBgilHRDWFCoFCAAQzAEqBgjZDhC/ASoGCKUdEKwBMAE6BgiQJhDDAUImChxwQ0wyMm93cDdmWkljVU1Ed3pvTXZYYWx0ZVgyEgAaACIAKAA="
    },
    {
        "id": "natural_filter_medium_dark_medium_f0ajaoxbeg1omvmoddhm",
        "process": "Natural",
        "category": "Filter",
        "roastDegree": "Medium-Dark",
        "developmentTime": "Medium",
        "name": "Natural Filter Medium-Dark (Medium Dev)",
        "durationLabel": "Development 72.60%",
        "notes": "IKAWA natural template",
        "roastProfileLink": "https://share.ikawa.support/profile_home/?CAESEJkgVUWVMEcZszq81y2BZsMaHE5hdHVyYWwgRmlsdGVyIG1lZGl1bS1kYXJrKysiBQgAEPQDIgYIqwIQ+A8iBgi7BRDhCyIGCLoRELETIgYIyBgQ2hQiBgjMHxDAFCoFCAAQzAEqBgiQEBDFASoGCMwfEKwBMAE6BgjYJBDMAUImChxwQ0wyMm93cDdmWkljVU1Ed3pvTXZYYWx0ZVgyEgAaACIAKAA="
    },
    {
        "id": "washed_espresso_dark_high_goxyaklo5pzwqh8xotcs",
        "process": "Washed",
        "category": "Espresso",
        "roastDegree": "Dark",
        "developmentTime": "High",
        "name": "Washed Espresso Dark (High Dev)",
        "durationLabel": "Development 61.61%",
        "notes": "IKAWA washed template",
        "roastProfileLink": "https://share.ikawa.support/profile_home/?CAESEHHEhqpGm0HAm4J7WbnlJM4aGFdhc2hlZCBFc3ByZXNzbyBkYXJrICsrKyIFCAAQ9AMiBgjpAxC5FCIGCJMIELgPIgYI0w4QlBIiBgjAEhCxEyIGCKIdEPEUIgYIzCcQmBMqBQgAENMBKgYIoAgQvAEqBgjMJxCtATABOgYI+jAQzgFCJgoccENMMjJvd3A3ZlpJY1VNRHd6b012WGFsdGVYMhIAGgAiACgA"
    },
    {
        "id": "washed_espresso_dark_low_ygu7d7gxcdfcjgovn6hj",
        "process": "Washed",
        "category": "Espresso",
        "roastDegree": "Dark",
        "developmentTime": "Low",
        "name": "Washed Espresso Dark (Low Dev)",
        "durationLabel": "Development 78.38%",
        "notes": "IKAWA washed template",
        "roastProfileLink": "https://share.ikawa.support/profile_home/?CAESELXT2lALRU6dugvJX3h6+hYaFldhc2hlZCBFc3ByZXNzbyBkYXJrICsiBQgAEPQDIgYIzwEQvwwiBgj0CxCbFSIGCPoPEJQRIgYIthkQuBIiBgjrIBDcEyoFCAAQzQEqBgi3GRC4ASoGCOsgEKUBMAE6BgiYKBDMAUImChxwQ0wyMm93cDdmWkljVU1Ed3pvTXZYYWx0ZVgyEgAaACIAKAA="
    },
    {
        "id": "washed_espresso_dark_medium_icen0lhufynypjpuxmsf",
        "process": "Washed",
        "category": "Espresso",
        "roastDegree": "Dark",
        "developmentTime": "Medium",
        "name": "Washed Espresso Dark (Medium Dev)",
        "durationLabel": "Development 69.97%",
        "notes": "IKAWA washed template",
        "roastProfileLink": "https://share.ikawa.support/profile_home/?CAESEEBfFGQ3qUSXrXz+FfuF+XgaF1dhc2hlZCBlc3ByZXNzbyBkYXJrICsrIgUIABD0AyIGCMMDENoMIgYI2wkQnhIiBgipExC+EyIGCM4YEK8UIgYIhyIQwBQqBQgAELwBKgYIigoQrAEqBgiHIhCkATABOgYI9yoQswFCJgoccENMMjJvd3A3ZlpJY1VNRHd6b012WGFsdGVYMhIAGgAiACgA"
    },
    {
        "id": "washed_espresso_light_high_gn6euksd10us8rrrrn1v",
        "process": "Washed",
        "category": "Espresso",
        "roastDegree": "Light",
        "developmentTime": "High",
        "name": "Washed Espresso Light (High Dev)",
        "durationLabel": "Development 82.61%",
        "notes": "IKAWA washed template",
        "roastProfileLink": "https://share.ikawa.support/profile_home/?CAESEBR8+uvVh0EOokzCvIAPcYwaGVdhc2hlZCBlc3ByZXNzbyBsaWdodCArKysiBQgAEPQDIgYIogMQowkiBgiFEBDsESIGCPEbEMITIgYIgSIQnhMqBQgAENMBKgYIgSIQsgEwAToGCK8rEM4BQiYKHHBDTDIyb3dwN2ZaSWNVTUR3em9NdlhhbHRlWDISABoAIgAoAA=="
    },
    {
        "id": "washed_espresso_light_low_vkyxysuz9x6jlamtrcfp",
        "process": "Washed",
        "category": "Espresso",
        "roastDegree": "Light",
        "developmentTime": "Low",
        "name": "Washed Espresso Light (Low Dev)",
        "durationLabel": "Development 93.86%",
        "notes": "IKAWA washed template",
        "roastProfileLink": "https://share.ikawa.support/profile_home/?CAESELpFQkftyUrUoZtu7tdMD7YaF1dhc2hlZCBlc3ByZXNzbyBsaWdodCArIgUIABD0AyIGCIIFEJISIgYIkwgQuA8iBgiRDxCCEiIGCJYTEKMSIgYI+BgQpBIiBgj3IBCIEioFCAAQ0wEqBgigCBC8ASoGCPcgEK0BMAE6BgilKhDOAUImChxwQ0wyMm93cDdmWkljVU1Ed3pvTXZYYWx0ZVgyEgAaACIAKAA="
    },
    {
        "id": "washed_espresso_light_medium_tahziet0hr7q7xyzyqkw",
        "process": "Washed",
        "category": "Espresso",
        "roastDegree": "Light",
        "developmentTime": "Medium",
        "name": "Washed Espresso Light (Medium Dev)",
        "durationLabel": "Development 83.05%",
        "notes": "IKAWA washed template",
        "roastProfileLink": "https://share.ikawa.support/profile_home/?CAESELL8Sdz4DUIHtwNBhylW+/0aGFdhc2hlZCBlc3ByZXNzbyBsaWdodCArKyIFCAAQ9AMiBgiYBRDPDyIGCKsPEL4RIgYI8hQQjhMiBgjEHhDdEioFCAAQ2AEqBgjUBBDVASoGCMQeELIBMAE6BgjxJRDMAUImChxwQ0wyMm93cDdmWkljVU1Ed3pvTXZYYWx0ZVgyEgAaACIAKAA="
    },
    {
        "id": "washed_espresso_light_medium_high_wjjrr6ml1odfc29h9o2q",
        "process": "Washed",
        "category": "Espresso",
        "roastDegree": "Light-Medium",
        "developmentTime": "High",
        "name": "Washed Espresso Light-Medium (High Dev)",
        "durationLabel": "Development 78.55%",
        "notes": "IKAWA washed template",
        "roastProfileLink": "https://share.ikawa.support/profile_home/?CAESEBP74ta2ZUgXsGz6BBtECAAaHldhc2hlZCBlc3ByZXNzbyBsaWdodG1lZGl1bSsrKyIFCAAQ9AMiBgjPARC/DCIGCL4MEIwTIgYI+g8QlBEiBgjoGRCGEiIGCPkmEJQTKgUIABDNASoGCLcZELgBKgYI+SYQpQEwAToGCKYuEMwBQiYKHHBDTDIyb3dwN2ZaSWNVTUR3em9NdlhhbHRlWDISABoAIgAoAA=="
    },
    {
        "id": "washed_espresso_light_medium_low_ped7y1ub8qtfjxn9nbpx",
        "process": "Washed",
        "category": "Espresso",
        "roastDegree": "Light-Medium",
        "developmentTime": "Low",
        "name": "Washed Espresso Light-Medium (Low Dev)",
        "durationLabel": "Development 89.24%",
        "notes": "IKAWA washed template",
        "roastProfileLink": "https://share.ikawa.support/profile_home/?CAESEMb7Q7mlI01Sty5R38aCMPQaHVdhc2hlZCBlc3ByZXNzbyBsaWdodC1tZWRpdW0rIgUIABD0AyIGCMYEEL0KIgYIiR4Q5RQiBgj2IxDfEioFCAAQzAEqBgj2IxCrATABOgYIgikQzAFCJgoccENMMjJvd3A3ZlpJY1VNRHd6b012WGFsdGVYMhIAGgAiACgA"
    },
    {
        "id": "washed_espresso_light_medium_medium_x2bytndr0enmco0ofi8c",
        "process": "Washed",
        "category": "Espresso",
        "roastDegree": "Light-Medium",
        "developmentTime": "Medium",
        "name": "Washed Espresso Light-Medium (Medium Dev)",
        "durationLabel": "Development 79.16%",
        "notes": "IKAWA washed template",
        "roastProfileLink": "https://share.ikawa.support/profile_home/?CAESENULB1iHSU3tiPVFpxQav4saHldhc2hlZCBlc3ByZXNzbyBsaWdodC1tZWRpdW0rKyIFCAAQ9AMiBgjPCBDwDSIGCN4UELoUIgYI2BkQwhMiBgiHIhCAEyoFCAAQ3gEqBgi+BhDLASoGCIciELQBMAE6Bgi0KRDMAUImChxwQ0wyMm93cDdmWkljVU1Ed3pvTXZYYWx0ZVgyEgAaACIAKAA="
    },
    {
        "id": "washed_espresso_medium_high_grz504uoobczbz6rfebj",
        "process": "Washed",
        "category": "Espresso",
        "roastDegree": "Medium",
        "developmentTime": "High",
        "name": "Washed Espresso Medium (High Dev)",
        "durationLabel": "Development 77.92%",
        "notes": "IKAWA washed template",
        "roastProfileLink": "https://share.ikawa.support/profile_home/?CAESEKTS7fJabUZEgzJn85UqIo4aGldhc2hlZCBlc3ByZXNzbyBtZWRpdW0gKysrIgUIABD0AyIGCLQDEJcKIgYIsg0QnBAiBgjUIhDNEyIGCNMoEJkTKgUIABDTASoGCNMoELIBMAE6BgiBMhDOAUImChxwQ0wyMm93cDdmWkljVU1Ed3pvTXZYYWx0ZVgyEgAaACIAKAA="
    },
    {
        "id": "washed_espresso_medium_low_sntflioqz86ekpzpucci",
        "process": "Washed",
        "category": "Espresso",
        "roastDegree": "Medium",
        "developmentTime": "Low",
        "name": "Washed Espresso Medium (Low Dev)",
        "durationLabel": "Development 84.56%",
        "notes": "IKAWA washed template",
        "roastProfileLink": "https://share.ikawa.support/profile_home/?CAESEDExncTPeEwBjiV5UFj6MIQaGFdhc2hlZCBFc3ByZXNzbyBtZWRpdW0gKyIFCAAQ9AMiBgiUAxD5ESIGCNgFELMPIgYIpxEQkBMiBgi4GhCcFCIGCMMcENgTKgUIABDWASoGCN0HEMABKgYIwxwQrAEwAToGCOMiELwBQiYKHHBDTDIyb3dwN2ZaSWNVTUR3em9NdlhhbHRlWDISABoAIgAoAA=="
    },
    {
        "id": "washed_espresso_medium_medium_swd3tykksoqf1nfr3gex",
        "process": "Washed",
        "category": "Espresso",
        "roastDegree": "Medium",
        "developmentTime": "Medium",
        "name": "Washed Espresso Medium (Medium Dev)",
        "durationLabel": "Development 74.75%",
        "notes": "IKAWA washed template",
        "roastProfileLink": "https://share.ikawa.support/profile_home/?CAESEDcOKXNR6khsrYA16xYsYDUaGVdhc2hlZCBlc3ByZXNzbyBtZWRpdW0gKysiBQgAEPQDIgYIpwQQnBAiBgjbFhC8EyIGCKkfEK4TKgUIABDTASoGCKAIELwBKgYIqR8QrQEwAToGCNcoEM4BQiYKHHBDTDIyb3dwN2ZaSWNVTUR3em9NdlhhbHRlWDISABoAIgAoAA=="
    },
    {
        "id": "washed_espresso_medium_dark_high_ki0sdmocfpc1h56ato4w",
        "process": "Washed",
        "category": "Espresso",
        "roastDegree": "Medium-Dark",
        "developmentTime": "High",
        "name": "Washed Espresso Medium-Dark (High Dev)",
        "durationLabel": "Development 67.28%",
        "notes": "IKAWA washed template",
        "roastProfileLink": "https://share.ikawa.support/profile_home/?CAESEC8T06jKxEepvShYuE7qCacaHldhc2hlZCBlc3ByZXNzbyBtZWRpdW0gZGFyaysrKyIFCAAQ9AMiBgj2AxDBECIGCL4MEKASIgYIgxcQ3xQiBgiSHhCPFCIGCM4hEIkUKgUIABDOASoGCNgVEL8BKgYIziEQrQEwAToGCJYnEMUBQiYKHHBDTDIyb3dwN2ZaSWNVTUR3em9NdlhhbHRlWDISABoAIgAoAA=="
    },
    {
        "id": "washed_espresso_medium_dark_low_zosjhabrfmuvgln7mjpp",
        "process": "Washed",
        "category": "Espresso",
        "roastDegree": "Medium-Dark",
        "developmentTime": "Low",
        "name": "Washed Espresso Medium-Dark (Low Dev)",
        "durationLabel": "Development 71.67%",
        "notes": "IKAWA washed template",
        "roastProfileLink": "https://share.ikawa.support/profile_home/?CAESEMLNspZwnkQpsbfgW3AQmw4aHVdhc2hlZCBlc3ByZXNzbyBtZWRpdW0gZGFyayArIgUIABD0AyIGCPwBEKQUIgYIrwQQhgwiBgjUGBD9FCIGCIogEM4TKgUIABDXASoGCIogEKwBMAE6BgiiJRC/AUImChxwQ0wyMm93cDdmWkljVU1Ed3pvTXZYYWx0ZVgyEgAaACIAKAA="
    },
    {
        "id": "washed_espresso_medium_dark_medium_mwjrykjjsrmnvoele63y",
        "process": "Washed",
        "category": "Espresso",
        "roastDegree": "Medium-Dark",
        "developmentTime": "Medium",
        "name": "Washed Espresso Medium-Dark (Medium Dev)",
        "durationLabel": "Development 72.43%",
        "notes": "IKAWA washed template",
        "roastProfileLink": "https://share.ikawa.support/profile_home/?CAESEEjxQk0ST0Y+n1810Ot84MgaHldhc2hlZCBFc3ByZXNzbyBtZWRpdW0tZGFyayArKyIFCAAQ9AMiBgirBRCzECIGCL4QEPoRIgYI+RkQ2BQiBgjxIBDAFCoFCAAQ2AEqBgjUBBDVASoGCPEgELIBMAE6BgieKBDMAUImChxwQ0wyMm93cDdmWkljVU1Ed3pvTXZYYWx0ZVgyEgAaACIAKAA="
    },
    {
        "id": "washed_filter_dark_high_w7aqlmibdhmwj2xohtqu",
        "process": "Washed",
        "category": "Filter",
        "roastDegree": "Dark",
        "developmentTime": "High",
        "name": "Washed Filter Dark (High Dev)",
        "durationLabel": "Development 62.45%",
        "notes": "IKAWA washed template",
        "roastProfileLink": "https://share.ikawa.support/profile_home/?CAESEMK0U5oPhkdAmYI1ZbajxYEaFldhc2hlZCBmaWx0ZXIgZGFyayArKysiBQgAEPQDIgYIigIQzhMiBgjjBhCRDSIGCOQMEIgSIgYIzxgQihUiBgi7IBDSFCoFCAAQ1wEqBgi7IBCsATABOgYI1CUQvwFCJgoccENMMjJvd3A3ZlpJY1VNRHd6b012WGFsdGVYMhIAGgAiACgA"
    },
    {
        "id": "washed_filter_dark_low_nkjtizxod6eqqvk7u0ow",
        "process": "Washed",
        "category": "Filter",
        "roastDegree": "Dark",
        "developmentTime": "Low",
        "name": "Washed Filter Dark (Low Dev)",
        "durationLabel": "Development 69.70%",
        "notes": "IKAWA washed template",
        "roastProfileLink": "https://share.ikawa.support/profile_home/?CAESEM4t/vtqP0ruiIU4fUZ164EaFFdhc2hlZCBmaWx0ZXIgZGFyayArIgUIABD0AyIGCJsEEJkVIgYI9AcQ8g4iBgjWFRCeFSIGCOYcEIkVIgYIuSAQqhQqBQgAENsBKgYIqgYQxAEqBgi5IBCeATABOgYI5ykQxQFCJgoccENMMjJvd3A3ZlpJY1VNRHd6b012WGFsdGVYMhIAGgAiACgA"
    },
    {
        "id": "washed_filter_dark_medium_kufpqn5nkwkxsxsc3kkx",
        "process": "Washed",
        "category": "Filter",
        "roastDegree": "Dark",
        "developmentTime": "Medium",
        "name": "Washed Filter Dark (Medium Dev)",
        "durationLabel": "Development 68.09%",
        "notes": "IKAWA washed template",
        "roastProfileLink": "https://share.ikawa.support/profile_home/?CAESEHgn8cPoQ0Rmj1vBi9uL0c4aG1dhc2hlZCBLZW55YSBGaWx0ZXIgZGFyayArKyIFCAAQ9AMiBgj9AhDsECIGCIgIEPYPIgYI7hcQjBUiBgj3HhC7EyoFCAAQ1gEqBgjACRDCASoGCPceEKwBMAE6BgiDJBDBAUImChxwQ0wyMm93cDdmWkljVU1Ed3pvTXZYYWx0ZVgyEgAaACIAKAA="
    },
    {
        "id": "washed_filter_light_high_x0gjx5w07tjgjxjm7r5u",
        "process": "Washed",
        "category": "Filter",
        "roastDegree": "Light",
        "developmentTime": "High",
        "name": "Washed Filter Light (High Dev)",
        "durationLabel": "Development 77.25%",
        "notes": "IKAWA washed template",
        "roastProfileLink": "https://share.ikawa.support/profile_home/?CAESEPH9hHaozUVcjKmQmYq+4soaF3dhc2hlZCBmaWx0ZXIgbGlnaHQgKysrIgUIABD0AyIGCO8EEIwUIgYIzAwQ2BAiBgjJExDcEiIGCNsYEJITIgYIoh8Q2xIqBQgAEMwBKgYIkBAQxQEqBgiiHxC2ATABOgYIriQQzAFCJgoccENMMjJvd3A3ZlpJY1VNRHd6b012WGFsdGVYMhIAGgAiACgA"
    },
    {
        "id": "washed_filter_light_low_j3d88th1twpfasdp4ycb",
        "process": "Washed",
        "category": "Filter",
        "roastDegree": "Light",
        "developmentTime": "Low",
        "name": "Washed Filter Light (Low Dev)",
        "durationLabel": "Development 87.49%",
        "notes": "IKAWA washed template",
        "roastProfileLink": "https://share.ikawa.support/profile_home/?CAESEOUC2y4VQ0Kvp6aRBEGcCH0aFXdhc2hlZCBmaWx0ZXIgbGlnaHQgKyIFCAAQ9AMiBgimAhC7CSIGCMsIEJARIgYImRAQ1RMiBgjuFxDbEiIGCOwcENsRKgUIABDNASoGCOwcELkBMAE6BgjaJxDHAUImChxwQ0wyMm93cDdmWkljVU1Ed3pvTXZYYWx0ZVgyEgAaACIAKAA="
    },
    {
        "id": "washed_filter_light_medium_zgcsg5ylmtre7htxse6s",
        "process": "Washed",
        "category": "Filter",
        "roastDegree": "Light",
        "developmentTime": "Medium",
        "name": "Washed Filter Light (Medium Dev)",
        "durationLabel": "Development 83.05%",
        "notes": "IKAWA washed template",
        "roastProfileLink": "https://share.ikawa.support/profile_home/?CAESEHbPkgOuXkQajYftX90Gjt8aFldhc2hlZCBmaWx0ZXIgbGlnaHQgKysiBQgAEPQDIgYIwQUQ0xMiBgjvCBD7DiIGCMQVEPETIgYImRoQ+BMiBgiFIBCbEyoFCAAQ2wEqBgiqBhDEASoGCIUgEKQBMAE6BgizKRDFAUImChxwQ0wyMm93cDdmWkljVU1Ed3pvTXZYYWx0ZVgyEgAaACIAKAA="
    },
    {
        "id": "washed_filter_light_medium_high_ga1ipoxvffsg5krsnege",
        "process": "Washed",
        "category": "Filter",
        "roastDegree": "Light-Medium",
        "developmentTime": "High",
        "name": "Washed Filter Light-Medium (High Dev)",
        "durationLabel": "Development 70.23%",
        "notes": "IKAWA washed template",
        "roastProfileLink": "https://share.ikawa.support/profile_home/?CAESECU4L73uAURbt4slA8t9pJ0aHldhc2hlZCBmaWx0ZXIgbGlnaHQtbWVkaXVtICsrKyIFCAAQ9AMiBgiNARDbCSIGCOQNEIQTIgYI3BAQvxQiBgifFhCFEyIGCMQeEPsSKgUIABDFASoGCMQeELIBMAE6BgjxJRDMAUImChxwQ0wyMm93cDdmWkljVU1Ed3pvTXZYYWx0ZVgyEgAaACIAKAA="
    },
    {
        "id": "washed_filter_light_medium_low_wcgmv6wyrbr29vvq2xht",
        "process": "Washed",
        "category": "Filter",
        "roastDegree": "Light-Medium",
        "developmentTime": "Low",
        "name": "Washed Filter Light-Medium (Low Dev)",
        "durationLabel": "Development 85.52%",
        "notes": "IKAWA washed template",
        "roastProfileLink": "https://share.ikawa.support/profile_home/?CAESECdnkTXMW0PsmuQSKYhNKwwaHFdhc2hlZCBmaWx0ZXIgIGxpZ2h0LW1lZGl1bSsiBQgAEPQDIgYI3AQQ+g4iBgj5ExCNESIGCKMZEKYUIgYI8SAQ8BIqBQgAEMwBKgYIoA4QwwEqBgjxIBCzATABOgYInigQzAFCJgoccENMMjJvd3A3ZlpJY1VNRHd6b012WGFsdGVYMhIAGgAiACgA"
    },
    {
        "id": "washed_filter_light_medium_medium_d9rwphyffnzlu6drxgtn",
        "process": "Washed",
        "category": "Filter",
        "roastDegree": "Light-Medium",
        "developmentTime": "Medium",
        "name": "Washed Filter Light-Medium (Medium Dev)",
        "durationLabel": "Development 82.48%",
        "notes": "IKAWA washed template",
        "roastProfileLink": "https://share.ikawa.support/profile_home/?CAESEHfLZQE680dJqEoF57Oe3ngaHVdhc2hlZCBmaWx0ZXIgbGlnaHQtbWVkaXVtICsrIgUIABD0AyIGCPkBENoPIgYI/wsQgRIiBgilExD8ECIGCJ0ZEPcTIgYIrhwQ2BMiBgjVHxDhEioFCAAQ1gEqBgigDhDDASoGCNUfEKIBMAE6BgiCJxDMAUImChxwQ0wyMm93cDdmWkljVU1Ed3pvTXZYYWx0ZVgyEgAaACIAKAA="
    },
    {
        "id": "washed_filter_medium_high_vlov2lkbngaixnqulrcs",
        "process": "Washed",
        "category": "Filter",
        "roastDegree": "Medium",
        "developmentTime": "High",
        "name": "Washed Filter Medium (High Dev)",
        "durationLabel": "Development 71.89%",
        "notes": "IKAWA washed template",
        "roastProfileLink": "https://share.ikawa.support/profile_home/?CAESELO+hui2O0xssnj+7OvEQn0aGFdhc2hlZCBmaWx0ZXIgbWVkaXVtICsrKyIFCAAQ9AMiBgijAxDfESIGCO4FEP4NIgYI5AwQiBIiBgjZFxCrEyIGCNsYELcUIgYI9h4QjxQqBQgAENcBKgYI9h4QrAEwAToGCI8kEL8BQiYKHHBDTDIyb3dwN2ZaSWNVTUR3em9NdlhhbHRlWDISABoAIgAoAA=="
    },
    {
        "id": "washed_filter_medium_low_ajma0mhxfpxvwdrtxhuu",
        "process": "Washed",
        "category": "Filter",
        "roastDegree": "Medium",
        "developmentTime": "Low",
        "name": "Washed Filter Medium (Low Dev)",
        "durationLabel": "Development 85.70%",
        "notes": "IKAWA washed template",
        "roastProfileLink": "https://share.ikawa.support/profile_home/?CAESEAOcaqzofkGBrG9WFajNkEgaFldhc2hlZCBmaWx0ZXIgbWVkaXVtICsiBQgAEPQDIgYI/QQQ1BQiBgj0BxDyDiIGCK4XENgUIgYIhRsQ2xQiBgiaHRCMFCoFCAAQ2wEqBgiqBhDEASoGCJodEKABMAE6BgjIJhDFAUImChxwQ0wyMm93cDdmWkljVU1Ed3pvTXZYYWx0ZVgyEgAaACIAKAA="
    },
    {
        "id": "washed_filter_medium_medium_zl0doftstitkvkgrmk6g",
        "process": "Washed",
        "category": "Filter",
        "roastDegree": "Medium",
        "developmentTime": "Medium",
        "name": "Washed Filter Medium (Medium Dev)",
        "durationLabel": "Development 79.57%",
        "notes": "IKAWA washed template",
        "roastProfileLink": "https://share.ikawa.support/profile_home/?CAESEO6KsCdoKEtJuuM7A9qNevgaF1dhc2hlZCBmaWx0ZXIgbWVkaXVtICsrIgUIABD0AyIGCLMDEKkRIgYI9wUQmw4iBgjcFBCkEyIGCOMaEKkUIgYI7SAQthMqBQgAENYBKgYI3QcQwAEqBgjtIBCsATABOgYI+SUQwAFCJgoccENMMjJvd3A3ZlpJY1VNRHd6b012WGFsdGVYMhIAGgAiACgA"
    },
    {
        "id": "washed_filter_medium_dark_high_xdgcyapxvmsc623iecdj",
        "process": "Washed",
        "category": "Filter",
        "roastDegree": "Medium-Dark",
        "developmentTime": "High",
        "name": "Washed Filter Medium-Dark (High Dev)",
        "durationLabel": "Development 71.93%",
        "notes": "IKAWA washed template",
        "roastProfileLink": "https://share.ikawa.support/profile_home/?CAESELeJbo/tgkHzo+WV3EgdRVEaHVdhc2hlZCBmaWx0ZXIgbWVkaXVtLWRhcmsgKysrIgUIABD0AyIGCOQEEOQTIgYI+gcQiQ4iBgizFxCaFSIGCMwhEKgUKgUIABDbASoGCKoGEMQBKgYIzCEQngEwAToGCPoqEMUBQiYKHHBDTDIyb3dwN2ZaSWNVTUR3em9NdlhhbHRlWDISABoAIgAoAA=="
    },
    {
        "id": "washed_filter_medium_dark_low_0eclhbm8imbs30hrw1sp",
        "process": "Washed",
        "category": "Filter",
        "roastDegree": "Medium-Dark",
        "developmentTime": "Low",
        "name": "Washed Filter Medium-Dark (Low Dev)",
        "durationLabel": "Development 82.82%",
        "notes": "IKAWA washed template",
        "roastProfileLink": "https://share.ikawa.support/profile_home/?CAESEJ4kGvanzUBVhxCNJYQ105caG1dhc2hlZCBGaWx0ZXIgbWVkaXVtLWRhcmsgKyIFCAAQ9AMiBgjkAxChFCIGCIMGEJMQIgYIuxMQ2BQiBgjlGRCqFCoFCAAQ1gEqBgjdBxDAASoGCOUZEKwBMAE6BgjxHhDAAUImChxwQ0wyMm93cDdmWkljVU1Ed3pvTXZYYWx0ZVgyEgAaACIAKAA="
    },
    {
        "id": "washed_filter_medium_dark_medium_t4ovlqxmaib9i8sldg6d",
        "process": "Washed",
        "category": "Filter",
        "roastDegree": "Medium-Dark",
        "developmentTime": "Medium",
        "name": "Washed Filter Medium-Dark (Medium Dev)",
        "durationLabel": "Development 76.90%",
        "notes": "IKAWA washed template",
        "roastProfileLink": "https://share.ikawa.support/profile_home/?CAESELih61sWZUCUr5nk0wgriv0aG1dhc2hlZCBmaWx0ZXIgbWVkaXVtLWRhcmsrKyIFCAAQ9AMiBgjkBBDkEyIGCPoHEIkOIgYIhRkQihUiBgiCGxCyFCIGCLkgEKoUKgUIABDbASoGCKoGEMQBKgYIuSAQngEwAToGCOcpEMUBQiYKHHBDTDIyb3dwN2ZaSWNVTUR3em9NdlhhbHRlWDISABoAIgAoAA=="
    }
] as NewProfileTemplate[];

export type NewProfileTemplateId = (typeof NEW_PROFILE_TEMPLATES)[number]["id"];
