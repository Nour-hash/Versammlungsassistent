package com.versammlungsassistent.dto;

public class ShareholderDTO {
    private String email;
    private String name;

    public ShareholderDTO(String email, String name) {
        this.email = email;
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public String getName() {
        return name;
    }
}
