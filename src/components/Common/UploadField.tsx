import React, {useEffect, useState} from "react";
import {IconButton, InputAdornment, TextField} from "@material-ui/core";
import PublishIcon from "@material-ui/icons/Publish";
import {TextFieldProps} from "@material-ui/core/TextField/TextField";
import {InputProps as StandardInputProps} from "@material-ui/core/Input/Input";
import {storage} from "../../firebase";

export function UploadField({potentialFilePath, value: ipValue, onChange, InputProps, ...rest}: Omit<TextFieldProps, "InputProps" | "onChange"> & { potentialFilePath: string; onChange?(value: string | null): void; InputProps?: Omit<Partial<StandardInputProps>, "endAdornment"> }) {
    const [uploadError, setUploadError] = useState<Error | null>(null);
    const [value, setValue] = useState(ipValue || rest.defaultValue);
    const [origValue, setOrigValue] = useState(ipValue);

    function update(value: string | null) {
        if(value) {
            setUploadError(null);
        }
        setValue(value);
        onChange?.(value);
    }

    useEffect(() => {
        if (ipValue !== origValue) {
            setValue(ipValue);
            setOrigValue(ipValue);
        }
    }, [origValue, ipValue]);

    useEffect(() => {
        if (uploadError) {
            console.log(uploadError);
        }
    }, [uploadError]);

    return <TextField
        {...rest}
        value={value}
        onChange={(e) => update(e.currentTarget.value)}
        InputProps={{
            ...InputProps,
            endAdornment: (
                <InputAdornment position="end">
                    <IconButton
                        title="Upload"
                        onClick={() => {
                            const input = document.createElement("input");
                            input.type = "file";

                            input.onchange = (e) => {
                                try {
                                    // @ts-ignore
                                    const file = e.target.files[0];
                                    if (!file) {
                                        setUploadError(new Error("Unknown"));
                                        return;
                                    } else if (file.size > 1000000) {
                                        setUploadError(
                                            new Error(
                                                "Please make sure your image is less than 1MB in size"
                                            )
                                        );
                                        return;
                                    }
                                    const child = storage.ref().child(potentialFilePath);
                                    child.put(file).then(() => child.getDownloadURL()).then((v) => {
                                        update(v);
                                    }).catch((e) => {
                                        setUploadError(e);
                                        update(null);
                                    });
                                } catch(e) {
                                    setUploadError(e);
                                }
                            };

                            input.click();
                        }}
                    >
                        <PublishIcon/>
                    </IconButton>
                </InputAdornment>
            ),
        }}
        error={!!uploadError}
        helperText={uploadError?.message}
    />
}