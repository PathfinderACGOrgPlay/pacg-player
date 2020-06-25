import {AutoInsertDropdown, AutoInsertDropdownProps} from "../../Wiki/Common/AutoInsertDropdown";
import {Typography} from "@material-ui/core";
import React from "react";


export function WikiEditAutoInsertDropdown({
                                        wikiEdit,
                                        ...rest
                                    }: AutoInsertDropdownProps & { wikiEdit: boolean | undefined }) {
    return wikiEdit ? (
        <AutoInsertDropdown {...rest} />
    ) : (
        <Typography>
            {Array.isArray(rest.value) ? rest.value.join(" ") : rest.value}
        </Typography>
    );
}