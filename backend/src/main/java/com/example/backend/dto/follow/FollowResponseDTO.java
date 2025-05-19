package com.example.backend.dto.follow;

import com.example.backend.entity.Follow;
import com.example.backend.entity.Notification;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class FollowResponseDTO {
    private Follow follow;
//    private Notification notification;

    public FollowResponseDTO(Follow follow) {
        this.follow = follow;
//        this.notification = notification;
    }
}
