package com.example.backend.controller;

import com.example.backend.dto.message.ConversationDTO;
import com.example.backend.dto.message.MessageResponseDTO;
import com.example.backend.entity.Conversation;
import com.example.backend.entity.User;
import com.example.backend.service.ChatService;
import com.example.backend.utils.constant.ApiMessage;
import com.example.backend.utils.error.IdInvalidException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/chat")
public class ChatController {

    @Autowired
    private ChatService chatService;

    /**
     * Lấy hoặc tạo cuộc trò chuyện giữa hai người dùng
     */
    @GetMapping("/conversation")
    @ApiMessage("Lấy hoặc tạo cuộc trò chuyện thành công")
    public ResponseEntity<Conversation> getOrCreateConversation(
            @RequestParam Long userId,
            @RequestParam Long otherUserId) throws IdInvalidException {

        Conversation conversation = chatService.getOrCreateConversation(userId, otherUserId);
        return ResponseEntity.ok(conversation);
    }

    /**
     * Tạo cuộc trò chuyện mới giữa hai người dùng (hỗ trợ POST)
     */
    @PostMapping("/conversation")
    @ApiMessage("Tạo cuộc trò chuyện thành công")
    public ResponseEntity<Conversation> createConversation(
            @RequestBody Map<String, Long> requestBody) throws IdInvalidException {

        Long userId = requestBody.get("userId");
        Long otherUserId = requestBody.get("otherUserId");

        if (userId == null || otherUserId == null) {
            throw new IdInvalidException("Thiếu userId hoặc otherUserId");
        }

        Conversation conversation = chatService.getOrCreateConversation(userId, otherUserId);
        return ResponseEntity.ok(conversation);
    }

    /**
     * Lấy danh sách cuộc trò chuyện của một người dùng
     */
    @GetMapping("/conversations/{userId}")
    @ApiMessage("Lấy danh sách cuộc trò chuyện thành công")
    public ResponseEntity<List<ConversationDTO>> getConversationsForUser(
            @PathVariable Long userId) throws IdInvalidException {

        List<ConversationDTO> conversations = chatService.getConversationsForUser(userId);
        return ResponseEntity.ok(conversations);
    }

    /**
     * Lấy tin nhắn của một cuộc trò chuyện theo trang
     */
    @GetMapping("/messages")
    @ApiMessage("Lấy tin nhắn thành công")
    public ResponseEntity<List<MessageResponseDTO>> getMessagesPaginated(
            @RequestParam Long conversationId,
            @RequestParam Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) throws IdInvalidException {

        List<MessageResponseDTO> messages = chatService.getMessagesPaginated(conversationId, userId, page, size);
        return ResponseEntity.ok(messages);
    }

    /**
     * Lấy cuộc trò chuyện nhóm
     */
    @GetMapping("/group-conversation")
    @ApiMessage("Lấy cuộc trò chuyện nhóm thành công")
    public ResponseEntity<Conversation> getGroupConversation() {
        Conversation conversation = chatService.getGroupConversation();
        return ResponseEntity.ok(conversation);
    }

    /**
     * Lấy thông tin chi tiết của một cuộc trò chuyện
     */
    @GetMapping("/conversation/{conversationId}")
    @ApiMessage("Lấy thông tin cuộc trò chuyện thành công")
    public ResponseEntity<ConversationDTO> getConversationById(
            @PathVariable Long conversationId,
            @RequestParam Long userId) throws IdInvalidException {

        ConversationDTO conversation = chatService.getConversationById(conversationId, userId);
        return ResponseEntity.ok(conversation);
    }

    @GetMapping("/conversationUsers/{userId}")
    public ResponseEntity<?> getConversationUsers(@PathVariable Long userId) {
        List<User> users = chatService.getUsersWithConversation(userId);
        return ResponseEntity.ok(users);
    }

    // Nhóm
    @PostMapping("/group")
    @ApiMessage("Tạo group chat thành công")
    public ResponseEntity<Conversation> createGroupConversation(@RequestBody Map<String, Object> requestBody)
            throws IdInvalidException {
        String groupName = (String) requestBody.get("name");
        List<?> userIdsRaw = (List<?>) requestBody.get("userIds");
        List<Long> userIds = userIdsRaw.stream()
                .map(id -> Long.valueOf(id.toString()))
                .toList();
        Conversation group = chatService.createGroupConversation(groupName, userIds);
        return ResponseEntity.ok(group);
    }

    @PostMapping("/group/{conversationId}/add")
    @ApiMessage("Thêm member mới thành công")
    public ResponseEntity<?> addUserToGroup(@PathVariable Long conversationId, @RequestParam Long userId)
            throws IdInvalidException {
        chatService.addUserToGroup(conversationId, userId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/group/{conversationId}/remove")
    @ApiMessage("Xóa member thành công")
    public ResponseEntity<?> removeUserFromGroup(@PathVariable Long conversationId, @RequestParam Long userId)
            throws IdInvalidException {
        chatService.removeUserFromGroup(conversationId, userId);
        return ResponseEntity.ok().build();
    }
}