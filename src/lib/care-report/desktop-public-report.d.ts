
export type PublicDesktopDeviceCheckReport = Awaited<ReturnType<typeof projectPublicDesktopDeviceCheckReport>>;
export declare function projectPublicDesktopDeviceCheckReport(value: unknown): {
    report_id: string;
    schema_version: "mbmc.desktop-device-check.v1" | "mbmc.desktop-device-check.v2" | "mbmc.desktop-device-check.v3" | "mbmc.desktop-device-check.v4";
    completed_at: string;
    accepted_at: string;
    device: {
        memory_bytes: number | null;
        storage_bytes: number | null;
        storage_nominal_capacity_bytes: number | null;
        part_number: string | null;
        regional_suffix: string | null;
        display_name: string;
        family: import("./desktop-model-metadata").PublicDesktopModelFamily | null;
        year: number | null;
        size: string | null;
        chip: string | null;
        serial: string | null;
        model_identifier: string;
    };
    battery: {
        current_capacity_mah: number | null;
        design_capacity_mah: number | null;
        cycle_count: number | null;
        condition: string | null;
        status: string | null;
        system_reported_health_percent: number | null;
        raw_capacity_health_percent: number | null;
        health_deviation_points: number | null;
        health_deviation_assessment: string | null;
    } | null;
    ssd: {
        estimated_health_percent: number | null;
        percentage_used: number | null;
        total_bytes_written: number | null;
        critical_warning: number | null;
        available_spare_percent: number | null;
        media_errors: number | null;
        data_integrity_errors: number | null;
    } | null;
    submitter: {
        role: "user";
        publication_type: "self_check";
        partner_public_id: null;
        display_name: null;
        network_name: null;
        verified_at_submission: false;
        physical_inspection_allowed: false;
        label_vi: string;
        label_en: string;
        manual_provenance_vi: string;
    } | {
        role: "inspector";
        publication_type: "verified_inspection";
        partner_public_id: string | null;
        display_name: string | null;
        network_name: string | null;
        verified_at_submission: true;
        physical_inspection_allowed: boolean;
        label_vi: string;
        label_en: string;
        manual_provenance_vi: string;
    } | {
        role: "delegated_inspector";
        publication_type: "delegated_inspection";
        partner_public_id: string | null;
        display_name: string | null;
        network_name: string | null;
        verified_at_submission: true;
        physical_inspection_allowed: boolean;
        label_vi: string;
        label_en: string;
        manual_provenance_vi: string;
    } | {
        role: "user";
        label_vi: string;
        label_en: string;
        manual_provenance_vi: string;
        partner_code?: undefined;
        display_name?: undefined;
        partner_type?: undefined;
        verified_at_submission?: undefined;
    } | {
        role: "technician_shop";
        label_vi: string;
        label_en: string;
        partner_code: string | null;
        display_name: string;
        partner_type: "technician" | "shop" | "lab";
        verified_at_submission: true;
        manual_provenance_vi: string;
    };
    summary: {
        passed: number;
        warning: number;
        failed: number;
        unknown: number;
    };
    diagnostics: ({
        diagnostic_id: "display" | "battery" | "storage" | "keyboard" | "system_overview" | "trackpad" | "camera" | "microphone" | "speakers" | "wifi" | "bluetooth" | "touch_id" | "ports" | "charging";
        title: Readonly<{
            vi: string;
            en: string;
        }>;
        outcome: "unknown" | "passed" | "failed" | "warning";
        outcome_label: Readonly<{
            vi: string;
            en: string;
        }>;
        summary: string | null;
    } | {
        findings: {
            finding_id: "speaker_left" | "speaker_right" | "trackpad_movement" | "trackpad_click" | "trackpad_scroll" | "magsafe" | "hdmi" | "sdxc" | "headphone_3_5mm" | "usb_c_left_rear" | "usb_c_left_front" | "usb_c_right_rear" | "usb_c_right_front" | "usb_c_right_single" | "keyboard_keys" | "keyboard_backlight" | "touch_bar" | "lid_sleep" | "display_visual";
            title: Readonly<{
                vi: string;
                en: string;
            }>;
            outcome: "unknown" | "passed" | "failed" | "warning";
            outcome_label: Readonly<{
                vi: string;
                en: string;
            }>;
            summary: string | null;
        }[];
        diagnostic_id: "display" | "battery" | "storage" | "keyboard" | "system_overview" | "trackpad" | "camera" | "microphone" | "speakers" | "wifi" | "bluetooth" | "touch_id" | "ports" | "charging";
        title: Readonly<{
            vi: string;
            en: string;
        }>;
        outcome: "unknown" | "passed" | "failed" | "warning";
        outcome_label: Readonly<{
            vi: string;
            en: string;
        }>;
        summary: string | null;
    })[];
    manual_inspection: {
        note: string | null;
        vi: string;
        en: string;
        supporting_vi: string;
        check_id: "repair_history_components";
        inspection_state: "not_opened" | "opened";
        observation: null | "no_visible_repair_signs" | "intervention_signs_found" | "inconclusive";
    } | {
        note: string | null;
        vi: string;
        en: string;
        supporting_vi: null;
        check_id: "repair_history_components";
        inspection_state: "not_opened" | "opened";
        observation: null | "no_visible_repair_signs" | "intervention_signs_found" | "inconclusive";
    } | null;
    limitations: {
        vi: string[];
        en: string[];
    };
    immutable_notice: {
        vi: string;
        en: string;
    };
} | {
    issues: import("./desktop-report-presentation").DesktopReportHighlight[];
    undetermined: import("./desktop-report-presentation").DesktopReportHighlight[];
    report_id: string;
    schema_version: "mbmc.desktop-device-check.v1" | "mbmc.desktop-device-check.v2" | "mbmc.desktop-device-check.v3" | "mbmc.desktop-device-check.v4";
    completed_at: string;
    accepted_at: string;
    device: {
        memory_bytes: number | null;
        storage_bytes: number | null;
        storage_nominal_capacity_bytes: number | null;
        part_number: string | null;
        regional_suffix: string | null;
        display_name: string;
        family: import("./desktop-model-metadata").PublicDesktopModelFamily | null;
        year: number | null;
        size: string | null;
        chip: string | null;
        serial: string | null;
        model_identifier: string;
    };
    battery: {
        current_capacity_mah: number | null;
        design_capacity_mah: number | null;
        cycle_count: number | null;
        condition: string | null;
        status: string | null;
        system_reported_health_percent: number | null;
        raw_capacity_health_percent: number | null;
        health_deviation_points: number | null;
        health_deviation_assessment: string | null;
    } | null;
    ssd: {
        estimated_health_percent: number | null;
        percentage_used: number | null;
        total_bytes_written: number | null;
        critical_warning: number | null;
        available_spare_percent: number | null;
        media_errors: number | null;
        data_integrity_errors: number | null;
    } | null;
    submitter: {
        role: "user";
        publication_type: "self_check";
        partner_public_id: null;
        display_name: null;
        network_name: null;
        verified_at_submission: false;
        physical_inspection_allowed: false;
        label_vi: string;
        label_en: string;
        manual_provenance_vi: string;
    } | {
        role: "inspector";
        publication_type: "verified_inspection";
        partner_public_id: string | null;
        display_name: string | null;
        network_name: string | null;
        verified_at_submission: true;
        physical_inspection_allowed: boolean;
        label_vi: string;
        label_en: string;
        manual_provenance_vi: string;
    } | {
        role: "delegated_inspector";
        publication_type: "delegated_inspection";
        partner_public_id: string | null;
        display_name: string | null;
        network_name: string | null;
        verified_at_submission: true;
        physical_inspection_allowed: boolean;
        label_vi: string;
        label_en: string;
        manual_provenance_vi: string;
    } | {
        role: "user";
        label_vi: string;
        label_en: string;
        manual_provenance_vi: string;
        partner_code?: undefined;
        display_name?: undefined;
        partner_type?: undefined;
        verified_at_submission?: undefined;
    } | {
        role: "technician_shop";
        label_vi: string;
        label_en: string;
        partner_code: string | null;
        display_name: string;
        partner_type: "technician" | "shop" | "lab";
        verified_at_submission: true;
        manual_provenance_vi: string;
    };
    summary: {
        passed: number;
        warning: number;
        failed: number;
        unknown: number;
    };
    diagnostics: ({
        diagnostic_id: "display" | "battery" | "storage" | "keyboard" | "system_overview" | "trackpad" | "camera" | "microphone" | "speakers" | "wifi" | "bluetooth" | "touch_id" | "ports" | "charging";
        title: Readonly<{
            vi: string;
            en: string;
        }>;
        outcome: "unknown" | "passed" | "failed" | "warning";
        outcome_label: Readonly<{
            vi: string;
            en: string;
        }>;
        summary: string | null;
    } | {
        findings: {
            finding_id: "speaker_left" | "speaker_right" | "trackpad_movement" | "trackpad_click" | "trackpad_scroll" | "magsafe" | "hdmi" | "sdxc" | "headphone_3_5mm" | "usb_c_left_rear" | "usb_c_left_front" | "usb_c_right_rear" | "usb_c_right_front" | "usb_c_right_single" | "keyboard_keys" | "keyboard_backlight" | "touch_bar" | "lid_sleep" | "display_visual";
            title: Readonly<{
                vi: string;
                en: string;
            }>;
            outcome: "unknown" | "passed" | "failed" | "warning";
            outcome_label: Readonly<{
                vi: string;
                en: string;
            }>;
            summary: string | null;
        }[];
        diagnostic_id: "display" | "battery" | "storage" | "keyboard" | "system_overview" | "trackpad" | "camera" | "microphone" | "speakers" | "wifi" | "bluetooth" | "touch_id" | "ports" | "charging";
        title: Readonly<{
            vi: string;
            en: string;
        }>;
        outcome: "unknown" | "passed" | "failed" | "warning";
        outcome_label: Readonly<{
            vi: string;
            en: string;
        }>;
        summary: string | null;
    })[];
    manual_inspection: {
        note: string | null;
        vi: string;
        en: string;
        supporting_vi: string;
        check_id: "repair_history_components";
        inspection_state: "not_opened" | "opened";
        observation: null | "no_visible_repair_signs" | "intervention_signs_found" | "inconclusive";
    } | {
        note: string | null;
        vi: string;
        en: string;
        supporting_vi: null;
        check_id: "repair_history_components";
        inspection_state: "not_opened" | "opened";
        observation: null | "no_visible_repair_signs" | "intervention_signs_found" | "inconclusive";
    } | null;
    limitations: {
        vi: string[];
        en: string[];
    };
    immutable_notice: {
        vi: string;
        en: string;
    };
};
