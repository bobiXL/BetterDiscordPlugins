/**
 * @name RoleInfo
 * @source https://github.com/bobiXL/BetterDiscordPlugins/blob/main/RoleInfo/RoleInfo.plugin.js
 * @description Shows role permissions and details such as colors, members.
 * @updateUrl https://raw.githubusercontent.com/bobiXL/BetterDiscordPlugins/main/RoleInfo/RoleInfo.plugin.js
 * @website https://github.com/bobiXL/BetterDiscordPlugins/tree/main/RoleInfo
 * @version 0.0.1
 */
const request = require("request");

const fs = require("fs");

const path = require("path");

const config = {
  info: {
    name: "RoleInfo",
    authors: [{
      name: "Bobix"
    }],
    version: "0.0.1",
    description: "Shows role permissions and details such as colors, members."
  },
  changelog: [{
    title: "Release",
    type: "added",
    items: ["Released 🎉"]
  }],
  defaultConfig: []
};
module.exports = !global.ZeresPluginLibrary ? class {
  constructor() {
    this._config = config;
  }

  load() {
    BdApi.showConfirmationModal("Library plugin is needed", `The library plugin needed for ARad'sPluginBuilder is missing. Please click Download Now to install it.`, {
      confirmText: "Download",
      cancelText: "Cancel",
      onConfirm: () => {
        request.get("https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js", (error, response, body) => {
          if (error) return electron.shell.openExternal("https://betterdiscord.net/ghdl?url=https://raw.githubusercontent.com/rauenzi/BDPluginLibrary/master/release/0PluginLibrary.plugin.js");
          fs.writeFileSync(path.join(BdApi.Plugins.folder, "0PluginLibrary.plugin.js"), body);
        });
      }
    });
  }

  start() {}

  stop() {}

} : (([Plugin, Library]) => {
  const {
    DiscordModules,
    WebpackModules,
    Patcher,
    Toasts,
    ContextMenu
  } = Library;
  const i18n = WebpackModules.getByProps("ROLE_COLOR");
  const {
    Strings,
    ElectronModule,
    React,
    GuildMemberStore,
    GuildStore
  } = DiscordModules;
  const MemberRole = WebpackModules.getByProps("MemberRole").MemberRole;
  const ColorComponents = WebpackModules.getByProps("DefaultColorButton");
  const {
    FormItem,
    FormText
  } = WebpackModules.getByProps("FormItem");
  const classes = { ...WebpackModules.getByProps("searchBoxInputWrapper"),
    ...WebpackModules.getByProps("descriptionRow"),
    ...WebpackModules.getByProps("member", "nameTag", "overflowIcon"),
    ...WebpackModules.getByProps("tabBarItem", "responsiveWidthMobile", "tabBarContainer"),
    ...WebpackModules.getByProps("codeRedemptionRedirect"),
    ...WebpackModules.getByProps("sidebar", "toolsContainer", "noticeRegion"),
    ...WebpackModules.getByProps("selected", "topPill", "brand"),
    ...WebpackModules.getByProps("roleDot")
  };
  const CheckmarkCircle = WebpackModules.getByDisplayName("CheckmarkCircle");
  const Avatar = WebpackModules.getByProps("AnimatedAvatar");
  const CloseCircle = WebpackModules.getModule(m => m.default.displayName === "CloseCircle" && m.default.name === "d").default;
  const {
    useGuildRoleMembers
  } = WebpackModules.getByProps("useGuildRoleMembers");
  const TextInput = WebpackModules.getByDisplayName("TextInput");
  const Paginator = WebpackModules.getByDisplayName("Paginator");
  const TabBar = WebpackModules.getByDisplayName("TabBar");
  const {
    Item,
    Types
  } = WebpackModules.getByProps("Item");
  const HelpCircle = WebpackModules.getByDisplayName("HelpCircle");
  const {
    TooltipContainer
  } = WebpackModules.getByProps("TooltipContainer");
  const {
    ScrollerThin
  } = WebpackModules.getByProps("ScrollerThin");

  function BooleanField({
    value,
    label
  }) {
    const Component = value ? CheckmarkCircle : CloseCircle;
    const color = value ? "var(--status-positive)" : "var(--status-danger)";
    return /*#__PURE__*/React.createElement("div", {
      className: classes.descriptionRow,
      style: {
        margin: 0
      }
    }, /*#__PURE__*/React.createElement(Component, {
      className: `${classes.descriptionIcon}`,
      color: color,
      backgroundColor: "white"
    }), label);
  }

  function Role({
    color,
    name
  }) {
    return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      class: classes.side
    }, /*#__PURE__*/React.createElement("div", {
      class: `${classes.selected} ${classes.item} ${classes.themed}`,
      style: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        pointerEvents: "none"
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: classes.roleDot,
      style: {
        backgroundColor: color,
        marginRight: 5
      }
    }), name)));
  }

  function ModalTabBar({
    onItemSelect,
    selectedItem
  }) {
    return /*#__PURE__*/React.createElement(TabBar, {
      className: classes.tabBar,
      style: {
        paddingBottom: 10
      },
      type: Types.TOP,
      onItemSelect: onItemSelect,
      selectedItem: selectedItem
    }, /*#__PURE__*/React.createElement(Item, {
      className: classes.tabBarItem,
      type: Types.TOP,
      id: "DETAILS"
    }, i18n.APPLICATION_STORE_SECTION_TITLE_DETAILS), /*#__PURE__*/React.createElement(Item, {
      className: classes.tabBarItem,
      type: Types.TOP,
      id: "PERMISSIONS"
    }, i18n.PERMISSIONS), /*#__PURE__*/React.createElement(Item, {
      className: classes.tabBarItem,
      type: Types.TOP,
      id: "MEMBERS"
    }, i18n.MEMBERS));
  }

  function Member({
    member,
    guildId
  }) {
    return /*#__PURE__*/React.createElement("div", {
      className: classes.member
    }, /*#__PURE__*/React.createElement(Avatar.default, {
      src: member.avatarURL,
      size: Avatar.Sizes.SIZE_40,
      status: null
    }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(FormText, {
      className: classes.name,
      style: {
        color: GuildMemberStore.getMember(guildId, member.id)?.colorString ?? "white"
      }
    }, member.name), /*#__PURE__*/React.createElement(FormText, {
      className: classes.tag
    }, "@", member.userTag)));
  }

  function MembersTab({
    members,
    guildId
  }) {
    const [page, setPage] = React.useState(1);
    const [search, setSearch] = React.useState("");
    return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(FormItem, {
      title: `${i18n.MEMBERS} - ${members.length}`
    }, /*#__PURE__*/React.createElement(TextInput, {
      name: "search",
      onChange: setSearch,
      value: search,
      placeholder: "Filter members",
      autoFocus: true,
      autoComplete: "off"
    })), /*#__PURE__*/React.createElement(ScrollerThin, {
      style: {
        height: 350
      }
    }, members.filter(member => Object.values(member).join().toLowerCase().includes(search.toLowerCase())).slice(5 * (page - 1), page * 5).map(member => /*#__PURE__*/React.createElement(Member, {
      guildId: guildId,
      member: member
    }))), /*#__PURE__*/React.createElement(Paginator, {
      currentPage: page,
      maxVisiblePages: 5,
      onPageChange: nextPage => setPage(nextPage),
      pageSize: 5,
      totalCount: members.length
    }));
  }

  function DetailsTab({
    role,
    guildId
  }) {
    const roles = Object.values(GuildStore.getGuild(guildId).roles);
    const roleAbove = roles.find(r => r.position === role.position + 1);
    const roleBelow = roles.find(r => r.position === role.position - 1);
    return /*#__PURE__*/React.createElement("div", {
      style: {
        height: 400
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        backgroundColor: "var(--background-secondary)",
        marginBottom: 10,
        padding: 10,
        borderRadius: 10,
        display: "flex",
        alignItems: "center"
      }
    }, /*#__PURE__*/React.createElement(BooleanField, {
      value: role.hoist,
      label: role.hoist ? "This role is displayed separately in the member list" : "This role isn't displayed separately in the member list"
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        paddingTop: 10
      }
    }, /*#__PURE__*/React.createElement(FormItem, {
      title: `Role Position - ${role.position}`
    }, /*#__PURE__*/React.createElement(FormText, null, "This role is in the ", role.position, "th position, which means that members with the roles below it are restricted with their actions on people with that role.")), /*#__PURE__*/React.createElement("div", {
      style: {
        alignSelf: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between"
      }
    }, roleAbove && /*#__PURE__*/React.createElement("div", {
      style: {
        transform: "scale(0.7)",
        opacity: 0.6
      }
    }, /*#__PURE__*/React.createElement(Role, {
      name: roleAbove.name,
      color: roleAbove.colorString
    })), /*#__PURE__*/React.createElement(Role, {
      name: role.name,
      color: role.colorString
    }), roleBelow && /*#__PURE__*/React.createElement("div", {
      style: {
        transform: "scale(0.7)",
        opacity: 0.6
      }
    }, /*#__PURE__*/React.createElement(Role, {
      name: roleBelow.name,
      color: roleBelow.colorString
    })))), /*#__PURE__*/React.createElement(FormItem, {
      title: i18n.ROLE_COLOR,
      style: {
        paddingBottom: 10
      }
    }, /*#__PURE__*/React.createElement(TooltipContainer, {
      text: "Click to copy color",
      position: "top",
      color: "primary"
    }, /*#__PURE__*/React.createElement(ColorComponents.DefaultColorButton, {
      color: role.color,
      onChange: () => {
        ElectronModule.copy(role.colorString);
        Toasts.show(`Copied role color for ${role.name}`, {
          type: "success"
        });
      }
    }))));
  }

  function PermissionsTab({
    role,
    guildId
  }) {
    const permissions = WebpackModules.getByProps("generateChannelPermissionSpec", "generateGuildPermissionSpec").generateGuildPermissionSpec(GuildStore.getGuild(guildId)).map(e => e.permissions).flat(1);
    const permissionFlags = Object.values(permissions).filter(permission => (role.permissions & permission.flag) == permission.flag);
    if (permissionFlags.length === 0) return /*#__PURE__*/React.createElement("div", {
      style: {
        height: 400
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: classes.descriptionRow,
      style: {
        backgroundColor: "var(--background-secondary)",
        margin: 0,
        marginBottom: 10,
        padding: 10,
        borderRadius: 10,
        display: "flex",
        alignItems: "center"
      }
    }, "This role does not have permissions"));
    return /*#__PURE__*/React.createElement(ScrollerThin, {
      style: {
        height: 450
      }
    }, permissionFlags.map(permission => /*#__PURE__*/React.createElement("div", {
      style: {
        backgroundColor: "var(--background-secondary)",
        marginBottom: 10,
        padding: 10,
        borderRadius: 10,
        display: "flex",
        alignItems: "center"
      }
    }, /*#__PURE__*/React.createElement(BooleanField, {
      label: permission?.title,
      value: (role.permissions & permission.flag) == permission.flag
    }), /*#__PURE__*/React.createElement(TooltipContainer, {
      text: permission.description,
      position: "top",
      color: "primary"
    }, /*#__PURE__*/React.createElement(HelpCircle, {
      color: "var(--text-normal)",
      style: {
        paddingLeft: 8
      },
      height: 12,
      width: 12
    })))));
  }

  function ModalContent(props) {
    const roleMembers = useGuildRoleMembers(props.guildId, props.role.id);
    const [selectedItem, setSelectedItem] = React.useState("DETAILS");
    const ScreenComponents = {
      DETAILS: DetailsTab,
      PERMISSIONS: PermissionsTab,
      MEMBERS: MembersTab
    };
    const ScreenComponent = ScreenComponents[selectedItem];
    return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(ModalTabBar, {
      selectedItem: selectedItem,
      onItemSelect: setSelectedItem
    }), /*#__PURE__*/React.createElement(ScreenComponent, {
      members: roleMembers,
      guildId: props.guildId,
      role: props.role
    }));
  }

  class plugin extends Plugin {
    constructor() {
      super();
    }

    onStart() {
      this.patch();
    }

    onStop() {
      Patcher.unpatchAll();
    }

    patch() {
      Patcher.after(MemberRole, "render", (_, [props], ret) => {
        const newContextMenu = ContextMenu.buildMenu([{
          label: "Role Info",
          action: _ => {
            BdApi.showConfirmationModal("Role Info - " + props.role.name, /*#__PURE__*/React.createElement(ModalContent, props), {
              cancelText: null
            });
          }
        }, {
          type: "separator"
        }, {
          id: "copy-id",
          label: Strings.Messages.COPY_ID,
          action: _ => {
            ElectronModule.copy(props.role.id);
          }
        }]);

        ret.props.children.props.onContextMenu = e => {
          ContextMenu.openContextMenu(e, newContextMenu);
        };
      });
    }

  }

  return plugin;
})(global.ZeresPluginLibrary.buildPlugin(config));
